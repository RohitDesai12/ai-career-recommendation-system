import joblib

def inspect():
    with open('output.txt', 'w') as f:
        try:
            scaler = joblib.load('scaler.pkl')
            features = getattr(scaler, 'feature_names_in_', ['Feature names not found'])
            f.write(f"Scaler features: {list(features)}\n")
        except Exception as e:
            f.write(f"Scaler features error: {e}\n")
            
        try:
            branch = joblib.load('branch_encoder.pkl')
            f.write(f"Branch encoder type: {type(branch)}\n")
            f.write(f"Branch categories: {getattr(branch, 'categories_', 'Unknown')}\n")
            f.write(f"Branch get_feature_names_out: {branch.get_feature_names_out() if hasattr(branch, 'get_feature_names_out') else 'N/A'}\n")
        except Exception as e:
            f.write(f"Branch error: {e}\n")

if __name__ == "__main__":
    inspect()
