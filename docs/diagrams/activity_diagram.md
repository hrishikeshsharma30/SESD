# Activity Diagram - Order Placement & Settlement Workflow

```mermaid
flowchart TD
    Start([User Initiates Order]) --> SelectType{Select Order Type}
    
    SelectType -->|BUY Order| CheckCash[Check User Virtual Balance >= Qty * Price]
    CheckCash --> IsCashSufficient{Sufficient Funds?}
    IsCashSufficient -->|No| RejectBuy[Reject Order with Insufficient Funds Error] --> End([Process Terminated])
    IsCashSufficient -->|Yes| ReserveCash[Reserve Funds: Deduct from User Balance]
    ReserveCash --> InsertBuyOrder[Insert Order as OPEN into Orders Table]
    
    SelectType -->|SELL Order| CheckHoldings[Check Portfolio Shares >= Qty]
    CheckHoldings --> IsHoldingsSufficient{Sufficient Shares?}
    IsHoldingsSufficient -->|No| RejectSell[Reject Order with Insufficient Shares Error] --> End
    IsHoldingsSufficient -->|Yes| ReserveShares[Reserve Shares: Deduct from User Portfolio]
    ReserveShares --> InsertSellOrder[Insert Order as OPEN into Orders Table]

    InsertBuyOrder --> InvokeEngine[Invoke Order Matching Engine]
    InsertSellOrder --> InvokeEngine
    
    InvokeEngine --> FetchBook[Load Order Book: Bids Sorted Price DESC, Asks Sorted Price ASC]
    FetchBook --> CheckMatch{Best Bid Price >= Best Ask Price?}
    
    CheckMatch -->|No Match| RestInBook[Leave Order OPEN in Book Waiting for Counterparty] --> SuccessEnd([Order Placed Successfully])
    
    CheckMatch -->|Match Found| ExecQty[Calculate Executable Quantity = min(Bid Remaining, Ask Remaining)]
    ExecQty --> ExecPrice[Determine Execution Price = Maker Order Price]
    ExecPrice --> AtomicTx[Begin Database Transaction]
    
    AtomicTx --> RecordTrade[Insert Record into Trades Table]
    RecordTrade --> UpdateRemaining[Update remaining_quantity for Both Orders]
    UpdateRemaining --> UpdateStatus{Remaining == 0?}
    UpdateStatus -->|Yes| SetFilled[Set Status = FILLED]
    UpdateStatus -->|No| SetPartial[Set Status = PARTIALLY_FILLED]
    
    SetFilled --> SettleAccounts[Credit Seller Balance, Update Buyer Portfolio Average Price]
    SetPartial --> SettleAccounts
    
    SettleAccounts --> AuditLedger[Record Ledger Transactions for Buyer & Seller]
    AuditLedger --> CommitTx[Commit Database Transaction]
    CommitTx --> CheckMoreMatches{More Compatible Orders?}
    CheckMoreMatches -->|Yes| CheckMatch
    CheckMoreMatches -->|No| SuccessEnd
```
