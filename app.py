from flask import Flask, render_template, request, jsonify
app=Flask(__name__)

def calculate_wpm(char_count, seconds):
    if seconds<=0 or char_count<0: return 0.0
    return round((char_count/5)/(seconds/60), 2)

def world_level(total_chars):
    thresholds=[0, 50, 150, 300, 600, 1000]
    for i in range(len(thresholds)-1, -1, -1):
        if total_chars>=thresholds[i]: return i
    return 0

@app.route('/')
def index(): return render_template('index.html')

@app.route('/health')
def health(): return jsonify({'status': 'ok'}), 200

@app.route('/api/stats', methods=['POST'])
def stats():
    data=request.get_json()
    chars, seconds = data.get('chars', 0), data.get('seconds', 0)
    return jsonify({'wpm': calculate_wpm(chars, seconds), 'level': world_level(chars)})

if __name__=='__main__': app.run(host='0.0.0.0', port=5000)
