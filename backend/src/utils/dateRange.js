// Builds a Mongo `createdAt` range from a from/to pair, falling back to a single date.
function buildDateFilter({ from = null, to = null, date = null } = {}) {
  if (from || to) {
    const range = {};
    if (from) {
      const start = new Date(from);
      if (!Number.isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        range.$gte = start;
      }
    }
    if (to) {
      const end = new Date(to);
      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
    }
    return Object.keys(range).length ? range : null;
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    if (Number.isNaN(start.getTime())) return null;
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { $gte: start, $lte: end };
  }

  return null;
}

module.exports = { buildDateFilter };
