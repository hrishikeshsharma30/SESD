# Sequence Diagram - Order Placement & Matching Engine Execution

```mermaid
sequenceDiagram
    autonumber
    actor User as Investor
    participant UI as React Frontend
    participant Route as Order Router (/api/orders/buy)
    participant OS as Order Service
    participant DB as PostgreSQL Database
    participant ME as Matching Engine
    participant TE as Trade Executor

    User->>UI: Enter Qty & Limit Price, Click "Place BUY Order"
    UI->>Route: POST /api/orders/buy (Bearer JWT, stockId, qty, price)
    Route->>OS: placeBuyOrder(userId, { stockId, qty, price })
    
    OS->>DB: BEGIN TRANSACTION
    OS->>DB: SELECT balance FROM users WHERE id = userId FOR UPDATE
    alt Insufficient Balance
        OS-->>UI: 400 Bad Request ("Insufficient virtual balance")
        UI-->>User: Show Error Alert
    else Sufficient Balance
        OS->>DB: UPDATE users SET balance = balance - totalCost
        OS->>DB: INSERT INTO orders (BUY, remaining = qty, status = 'OPEN')
        OS->>DB: COMMIT
        OS-->>ME: matchOrdersForStock(stockId)
        
        ME->>DB: Fetch Bids (Price DESC, Time ASC) & Asks (Price ASC, Time ASC)
        loop While Compatible Orders Exist (Buy Price >= Sell Price)
            ME->>TE: executeTrade(bestBid, bestAsk, executableQty, executionPrice)
            TE->>DB: BEGIN TRANSACTION
            TE->>DB: INSERT INTO trades (buy_order_id, sell_order_id, qty, price)
            TE->>DB: UPDATE orders (reduce remaining_qty, set FILLED/PARTIALLY_FILLED)
            TE->>DB: UPDATE portfolio (buyer +qty, weighted avg price; seller -qty)
            TE->>DB: UPDATE users (seller balance +tradeAmount, buyer price refund if maker price lower)
            TE->>DB: INSERT INTO transactions (BUY_DEDUCTION, SELL_CREDIT)
            TE->>DB: UPDATE stocks SET current_price = executionPrice
            TE->>DB: COMMIT
        end
        
        ME-->>OS: Executed Trades Array
        OS-->>UI: 201 Created (Order details + Instant matched trades)
        UI->>User: Display Success Alert & Update Live Portfolio / Balance
    end
```
