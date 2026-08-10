import re
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split



def extract_number(text):
    if pd.isna(text):
        return np.nan
    match = re.search(r'[\d.]+', str(text))
    return float(match.group()) if match else np.nan



def load_and_clean_data(path="../data/raw/cardata.csv"):
    df = pd.read_csv(path)
    df = df[df['Kilometer'] <= 1000000]
    return df


def stratified_split(df, test_size=0.2, random_state=42):
    df = df.copy()
    df['year_cat'] = pd.cut(df['Year'],
                             bins=[1987, 2012, 2015, 2018, 2020, np.inf],
                             labels=[1, 2, 3, 4, 5])
    train_set, test_set = train_test_split(
        df, test_size=test_size, stratify=df['year_cat'], random_state=random_state
    )
    train_set = train_set.drop('year_cat', axis=1)
    test_set = test_set.drop('year_cat', axis=1)
    return train_set, test_set