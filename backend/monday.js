require('dotenv').config();

const MONDAY_API = 'https://api.monday.com/v2';
const TOKEN = process.env.MONDAY_TOKEN;
const BOARD_ID = '5093190297';

// Column IDs
const COL = {
  deliveryStatus: 'color_mm1fz4yx',
  deliveryDate: 'date_mm1fmsms',
  location: 'location_mm1fxrz4',
};

// Map app status → Monday.com status index
const STATUS_TO_MONDAY = {
  pending: 0,
  on_route: 7,
  delayed: 2,
  delivered: 1,
};

// Map Monday.com status index → app status
const MONDAY_TO_STATUS = {
  0: 'pending',
  7: 'on_route',
  2: 'delayed',
  1: 'delivered',
  10: 'pending', // Cancelled → treat as pending
};

async function mondayQuery(query, variables = {}) {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) {
    throw new Error(`Monday.com API error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

// Fetch all items from the Monday.com board
async function fetchBoardItems() {
  const data = await mondayQuery(`{
    boards(ids: ${BOARD_ID}) {
      items_page(limit: 500) {
        items {
          id
          name
          column_values {
            id
            type
            text
            value
          }
        }
      }
    }
  }`);
  return data.boards[0].items_page.items;
}

// Create an item on Monday.com board
async function createMondayItem(delivery) {
  const statusIndex = STATUS_TO_MONDAY[delivery.status] ?? 0;
  const columnValues = {
    [COL.deliveryStatus]: { index: statusIndex },
  };

  if (delivery.expected_delivery_time) {
    const date = delivery.expected_delivery_time.split('T')[0];
    columnValues[COL.deliveryDate] = { date };
  }

  if (delivery.lat != null && delivery.lng != null) {
    columnValues[COL.location] = {
      lat: delivery.lat,
      lng: delivery.lng,
      address: delivery.address || '',
    };
  }

  const itemName = delivery.recipient_name
    ? `${delivery.recipient_name} - ${delivery.address}`
    : delivery.address;

  const data = await mondayQuery(`
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
      }
    }
  `, {
    boardId: BOARD_ID,
    itemName: itemName,
    columnValues: JSON.stringify(columnValues),
  });

  return data.create_item.id;
}

// Update delivery status on Monday.com
async function updateMondayStatus(mondayItemId, status) {
  const statusIndex = STATUS_TO_MONDAY[status];
  if (statusIndex == null) return;

  const columnValues = {
    [COL.deliveryStatus]: { index: statusIndex },
  };

  await mondayQuery(`
    mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
        id
      }
    }
  `, {
    boardId: BOARD_ID,
    itemId: String(mondayItemId),
    columnValues: JSON.stringify(columnValues),
  });
}

// Parse a Monday.com item into our delivery format
function parseMondayItem(item) {
  const cols = {};
  for (const cv of item.column_values) {
    cols[cv.id] = cv;
  }

  let status = 'pending';
  if (cols[COL.deliveryStatus]?.value) {
    const parsed = JSON.parse(cols[COL.deliveryStatus].value);
    status = MONDAY_TO_STATUS[parsed.index] || 'pending';
  }

  let expectedDate = null;
  if (cols[COL.deliveryDate]?.value) {
    const parsed = JSON.parse(cols[COL.deliveryDate].value);
    expectedDate = parsed.date ? `${parsed.date}T12:00:00` : null;
  }

  let lat = null, lng = null, address = item.name;
  if (cols[COL.location]?.value) {
    const parsed = JSON.parse(cols[COL.location].value);
    lat = parsed.lat || null;
    lng = parsed.lng || null;
    if (parsed.address) address = parsed.address;
  }

  return {
    monday_item_id: item.id,
    name: item.name,
    address,
    lat,
    lng,
    expected_delivery_time: expectedDate,
    status,
  };
}

module.exports = {
  fetchBoardItems,
  createMondayItem,
  updateMondayStatus,
  parseMondayItem,
  BOARD_ID,
};
