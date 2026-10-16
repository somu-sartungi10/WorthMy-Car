"""Per-prediction feature contributions for the car price RandomForest.

For every tree we walk the decision path from root to the reached leaf. Each
split moves the node's predicted value, and that change is attributed to the
feature used for the split. Averaging over all trees reproduces the forest's
prediction exactly:

    prediction = base_value + sum(contributions)

One-hot encoded columns are aggregated back into their original input column
(e.g. every ``cat__Make_*`` column folds back into ``Make``).
"""

import numpy as np

# EngineSpecExtractor renames these before encoding.
_FRIENDLY_NAMES = {
    "engine_cc": "Engine capacity (cc)",
    "max_power_bhp": "Max power (bhp)",
    "max_torque_nm": "Max torque (Nm)",
}


def _encoded_feature_groups(preprocessor):
    """Map each encoded feature index back to its original input column."""
    groups = []

    for name, _transformer, columns in preprocessor.transformers_:
        if name == "remainder" or len(columns) == 0:
            continue

        if name == "num":
            # Numeric pipeline keeps a 1:1 mapping (imputer + scaler).
            groups.extend(str(column) for column in columns)
        else:
            # Categorical pipeline one-hot encodes each column.
            onehot = preprocessor.named_transformers_[name].named_steps["onehot"]
            for column, categories in zip(columns, onehot.categories_):
                groups.extend([str(column)] * len(categories))

    return groups


def explain_prediction(pipeline, frame):
    """Decompose the pipeline's prediction into per-column contributions."""
    preprocessing = pipeline.named_steps["preprocessing"]
    forest = pipeline.named_steps["model"]

    encoded = preprocessing.transform(frame)
    if hasattr(encoded, "toarray"):
        encoded = encoded.toarray()
    encoded = np.asarray(encoded, dtype=float)

    if encoded.shape[0] != 1:
        raise ValueError("explain_prediction expects exactly one row")

    groups = _encoded_feature_groups(preprocessing.named_steps["preprocess"])
    if len(groups) != encoded.shape[1]:
        raise ValueError(
            f"Feature group mapping mismatch: {len(groups)} groups "
            f"for {encoded.shape[1]} encoded features"
        )

    row = encoded[0]
    contributions = np.zeros(encoded.shape[1], dtype=float)
    base_value = 0.0

    for estimator in forest.estimators_:
        tree = estimator.tree_

        # Use the estimator's own traversal so the path (and tie handling)
        # matches what `predict` would do for this exact row.
        nodes = estimator.decision_path(encoded).indices

        base_value += float(tree.value[nodes[0], 0, 0])

        for parent, child in zip(nodes[:-1], nodes[1:]):
            feature = tree.feature[parent]
            if feature < 0:  # a leaf never appears before the path ends
                continue
            delta = float(tree.value[child, 0, 0]) - float(tree.value[parent, 0, 0])
            contributions[feature] += delta

    # Average across trees: both the baseline and the contributions are means
    # over the forest, which makes base_value + sum(contributions) == predict.
    base_value /= len(forest.estimators_)
    contributions /= len(forest.estimators_)

    # Fold one-hot columns back into their source column.
    totals = {}
    for group, amount in zip(groups, contributions):
        totals[group] = totals.get(group, 0.0) + float(amount)

    ordered = sorted(totals.items(), key=lambda item: abs(item[1]), reverse=True)

    return {
        "base_value": round(base_value, 2),
        "contributions": [
            {
                "feature": _FRIENDLY_NAMES.get(name, name),
                "contribution": round(amount, 2),
            }
            for name, amount in ordered
        ],
    }
