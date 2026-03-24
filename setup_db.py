import os
import json
import sqlite3

db_path = "o2c.sqlite"
base_dir = "sap-o2c-data"

if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def get_schema(sample_dict):
    cols = []
    for k in sample_dict.keys():
        cols.append(f'"{k}" TEXT')
    return ", ".join(cols)

def format_row(row_dict):
    out = {}
    for k, v in row_dict.items():
        if isinstance(v, dict) or isinstance(v, list):
            out[k] = json.dumps(v)
        else:
            
            out[k] = str(v) if v is not None else None
    return out

for dir_name in os.listdir(base_dir):
    dir_path = os.path.join(base_dir, dir_name)
    if not os.path.isdir(dir_path):
        continue
    
    files = [f for f in os.listdir(dir_path) if f.endswith('.jsonl')]
    if not files:
        continue
    
    table_name = dir_name
    
    # read first line of first file to infer schema
    first_file = os.path.join(dir_path, files[0])
    with open(first_file, 'r', encoding='utf-8') as f:
        line = f.readline()
        if not line:
            continue
        sample = json.loads(line)
        schema_def = get_schema(sample)
        cursor.execute(f'CREATE TABLE "{table_name}" ({schema_def})')
    
    # insert data
    print(f"Loading {table_name}...")
    for file_name in files:
        file_path = os.path.join(dir_path, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                row = json.loads(line)
                row_fmt = format_row(row)
                
                cols = list(row_fmt.keys())
                placeholders = ",".join(["?"] * len(cols))
                q = f'INSERT INTO "{table_name}" ({", ".join([f"{c}" for c in cols])}) VALUES ({placeholders})'
                
                cursor.execute(q, [row_fmt[c] for c in cols])
                
    conn.commit()

# Create some indexes to speed up typical joins
indexes = [
    'CREATE INDEX idx_soh_so ON sales_order_headers(salesOrder);',
    'CREATE INDEX idx_soi_so ON sales_order_items(salesOrder);',
    'CREATE INDEX idx_odi_so ON outbound_delivery_items(referenceSdDocument);',
    'CREATE INDEX idx_odi_del ON outbound_delivery_items(deliveryDocument);',
    'CREATE INDEX idx_odh_del ON outbound_delivery_headers(deliveryDocument);',
    'CREATE INDEX idx_bdi_sd ON billing_document_items(referenceSdDocument);',
    'CREATE INDEX idx_bdi_bd ON billing_document_items(billingDocument);',
    'CREATE INDEX idx_bdh_bd ON billing_document_headers(billingDocument);',
    'CREATE INDEX idx_bdh_ad ON billing_document_headers(accountingDocument);',
    'CREATE INDEX idx_jei_rd ON journal_entry_items_accounts_receivable(referenceDocument);',
    'CREATE INDEX idx_par_cad ON payments_accounts_receivable(clearingAccountingDocument);'
]

for idx in indexes:
    try:
        cursor.execute(idx)
    except Exception as e:
        print(f"Skipping index: {e}")

conn.commit()
conn.close()
print("Database created successfully at", db_path)
