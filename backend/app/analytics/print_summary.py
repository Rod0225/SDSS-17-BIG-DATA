import json

with open('data/reports/initial_inspection.json') as f:
    data = json.load(f)

print(f"{'COLUMN':12} | {'DTYPE':7} | {'NUNIQUE':7} | {'MIN':10} | {'MAX':10} | {'MEAN':10} | {'STD':8} | {'IQR_OUTLIERS':12}")
print("-" * 88)
for col, s in data['columns_stats'].items():
    if 'min' in s:
        print(f"{col:12} | {s['dtype']:7} | {s['nunique']:7} | {s['min']:10.2f} | {s['max']:10.2f} | {s['mean']:10.2f} | {s['std']:8.2f} | {s['outliers_iqr']:12}")
    else:
        print(f"{col:12} | {s['dtype']:7} | {s['nunique']:7} | values: {s.get('value_counts')}")

