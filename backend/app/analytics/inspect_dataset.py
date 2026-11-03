import pandas as pd
import numpy as np
import json
import os

def inspect():
    csv_path = os.path.join('data', 'raw', 'star_classification.csv')
    df = pd.read_csv(csv_path)

    print(f"Total Rows: {len(df)}")
    print(f"Total Columns: {len(df.columns)}")
    print(f"Columns: {list(df.columns)}")

    info = {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": list(df.columns),
        "class_distribution": df['class'].value_counts().to_dict(),
        "class_proportions": (df['class'].value_counts(normalize=True) * 100).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "exact_duplicates": int(df.duplicated().sum()),
        "unique_obj_id": int(df['obj_ID'].nunique()),
        "columns_stats": {}
    }

    print("\n--- CLASS DISTRIBUTION ---")
    for k, v in info["class_distribution"].items():
        pct = info["class_proportions"][k]
        print(f"  {k}: {v} ({pct:.2f}%)")

    print("\n--- MISSING VALUES ---")
    missing_any = False
    for col, null_count in info["missing_values"].items():
        if null_count > 0:
            missing_any = True
            print(f"  {col}: {null_count} nulls")
    if not missing_any:
        print("  Zero missing values across all 18 columns!")

    print("\n--- ANOMALIES & EXTREME VALUES ---")
    for band in ['u', 'g', 'r', 'i', 'z']:
        neg = (df[band] < 0).sum()
        anom = (df[band] <= -9000).sum()
        print(f"  Band '{band}': min={df[band].min():.4f}, max={df[band].max():.4f}, neg_count={neg}, extreme_neg={anom}")

    print(f"  Redshift: min={df['redshift'].min():.4f}, max={df['redshift'].max():.4f}, negative={(df['redshift'] < 0).sum()}")
    print(f"  rerun_ID unique: {df['rerun_ID'].unique().tolist()}")

    # Compute comprehensive stats per column
    for col in df.columns:
        s = df[col]
        col_type = str(s.dtype)
        is_num = pd.api.types.is_numeric_dtype(s)
        col_stat = {
            "dtype": col_type,
            "nulls": int(s.isnull().sum()),
            "nunique": int(s.nunique()),
        }
        if is_num:
            col_stat.update({
                "min": float(s.min()),
                "max": float(s.max()),
                "mean": float(s.mean()),
                "median": float(s.median()),
                "std": float(s.std()),
                "q25": float(s.quantile(0.25)),
                "q75": float(s.quantile(0.75)),
                "iqr": float(s.quantile(0.75) - s.quantile(0.25))
            })
            # Count IQR outliers
            q25 = col_stat["q25"]
            q75 = col_stat["q75"]
            iqr = col_stat["iqr"]
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            outliers = int(((s < lower_bound) | (s > upper_bound)).sum())
            col_stat["outliers_iqr"] = outliers
        else:
            col_stat["value_counts"] = {str(k): int(v) for k, v in s.value_counts().items()}
        info["columns_stats"][col] = col_stat

    os.makedirs(os.path.join('data', 'reports'), exist_ok=True)
    report_file = os.path.join('data', 'reports', 'initial_inspection.json')
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=2)
    print(f"\nSaved initial inspection report to {report_file}")

if __name__ == '__main__':
    inspect()
