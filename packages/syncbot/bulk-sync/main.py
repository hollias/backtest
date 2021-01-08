import yfinance as yf
import sys

ticker = sys.argv[1]
data = yf.Ticker(ticker)
history = data.history(period="max", interval="1mo")
length = len(history.index)
if length == 0:
    raise Exception('History is empty')
history.to_csv(f'history/{ticker}.csv', header=False)