from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer, make_column_selector as selector
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from .data_preprocessing import extract_number


class EngineSpecExtractor(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        X['engine_cc'] = X['Engine'].apply(extract_number)
        X['max_power_bhp'] = X['Max Power'].apply(extract_number)
        X['max_torque_nm'] = X['Max Torque'].apply(extract_number)
        return X.drop(columns=['Engine', 'Max Power', 'Max Torque'])


def build_pipeline():
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('std_scaler', StandardScaler()),
    ])
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore')),
    ])
    preprocess = ColumnTransformer([
        ('num', num_pipeline, selector(dtype_include=['int64', 'float64'])),
        ('cat', cat_pipeline, selector(dtype_include=['object'])),
    ])
    return Pipeline([
        ('spec_extractor', EngineSpecExtractor()),
        ('preprocess', preprocess),
    ])