/**
 * Order Book Data Structure & Sorting Rules
 * Implements Price-Time Priority:
 *
 * BUY Orders:
 *   1. Highest Price first (price DESC)
 *   2. Earliest timestamp first (created_at ASC)
 *
 * SELL Orders:
 *   1. Lowest Price first (price ASC)
 *   2. Earliest timestamp first (created_at ASC)
 */

class OrderBook {
  /**
   * Sort Buy orders according to price-time priority
   */
  static sortBids(orders) {
    return orders.sort((a, b) => {
      const priceDiff = parseFloat(b.price) - parseFloat(a.price);
      if (priceDiff !== 0) return priceDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  /**
   * Sort Sell orders according to price-time priority
   */
  static sortAsks(orders) {
    return orders.sort((a, b) => {
      const priceDiff = parseFloat(a.price) - parseFloat(b.price);
      if (priceDiff !== 0) return priceDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }
}

module.exports = OrderBook;
