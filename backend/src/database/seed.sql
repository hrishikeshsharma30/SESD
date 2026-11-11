-- ==========================================================
-- PostgreSQL Seed Script for Virtual Stock Exchange (SESD)
-- ==========================================================

-- 1. Insert Initial Demo Stocks
INSERT INTO stocks (symbol, company_name, current_price, previous_price)
VALUES 
  ('TCS', 'Tata Consultancy Services Ltd.', 3850.00, 3820.00),
  ('INFY', 'Infosys Limited', 1620.00, 1635.00),
  ('RELIANCE', 'Reliance Industries Ltd.', 2980.00, 2940.00),
  ('HDFCBANK', 'HDFC Bank Limited', 1680.00, 1675.00),
  ('ICICIBANK', 'ICICI Bank Limited', 1120.00, 1110.00),
  ('WIPRO', 'Wipro Limited', 480.00, 485.00),
  ('ITC', 'ITC Limited', 435.00, 430.00),
  ('SBIN', 'State Bank of India', 790.00, 785.00)
ON CONFLICT (symbol) DO UPDATE 
SET current_price = EXCLUDED.current_price,
    previous_price = EXCLUDED.previous_price;
