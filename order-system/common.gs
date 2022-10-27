// スプレッドシート操作用
const SpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
const Sheet = {
  Order: SpreadSheet.getSheetByName("order"),
  Shop: SpreadSheet.getSheetByName("shop"),
  Setting: SpreadSheet.getSheetByName("setting"),
};

// orderシートの各列の情報（列番号）
const OrderSheetHeaders = {};
const OrderSheetHeaderMenus = [];

// settingシートの情報（LINE Developersの設定値）
const Config = {
  LineChanleAccessToken: Sheet.Setting.getRange(2, 3).getValue(),
  YourUserId: Sheet.Setting.getRange(3, 3).getValue(),
};

// shopシートの情報
const Shop = {
  ShopName: Sheet.Shop.getRange(2, 3).getValue(),
  OrderReceivedMailTitle: Sheet.Shop.getRange(5, 3).getValue(),
  OrderReceivedMailBody: Sheet.Shop.getRange(6, 3).getValue(),
  DeriverlingMailTitle: Sheet.Shop.getRange(9, 3).getValue(),
  DeriverlingdMailBody: Sheet.Shop.getRange(10, 3).getValue(),
};

// オーダー操作種別
const Operation = {
  OrderAccept: "受付完了",
  Delivering: "準備完了",
};

createOrderClmHeader();

/**
 * orderシートの列項目のインデックスを動的に取得
 * メニュー数を可変にできるため
 */
function createOrderClmHeader() {
  const lastRow = Sheet.Setting.getLastRow();
  const values = Sheet.Setting.getRange(11, 2, lastRow - 10, 2).getValues();
  for (let i = 0; i < lastRow - 10; i++) {
    if (values[i][0] != "Menu") {
      OrderSheetHeaders[values[i][0]] = values[i][1];
    } else {
      OrderSheetHeaderMenus.push(values[i][1]);
    }
  }
}

/**
 * オーダーIDに該当するオーダー行を取得
 * @param orderId
 * @returns
 */
function getOrder(orderId) {
  const orders = Sheet.Order.getRange(
    orderId,
    1,
    1,
    OrderSheetHeaders.OrderId
  ).getValues();

  const order = {
    orderTime: orders[0][OrderSheetHeaders.OrderTime - 1],
    customer: orders[0][OrderSheetHeaders.Customer - 1],
    phone1: orders[0][OrderSheetHeaders.Phone1 - 1],
    phone2: orders[0][OrderSheetHeaders.Phone2 - 1],
    email: orders[0][OrderSheetHeaders.Email - 1],
    amount: orders[0][OrderSheetHeaders.Amount - 1],
    soup: orders[0][OrderSheetHeaders.Soup - 1],
    kind: orders[0][OrderSheetHeaders.Kind - 1],
    comment: orders[0][OrderSheetHeaders.Comment - 1],
    ordered: orders[0][OrderSheetHeaders.Ordered - 1],
    delivering: orders[0][OrderSheetHeaders.Delivering - 1],
    delivered: orders[0][OrderSheetHeaders.Delivered - 1],
    orderId: orders[0][OrderSheetHeaders.OrderId - 1],
  };

  // メニュー数は可変にできるため動的に取得
  order["menus"] = [];
  OrderSheetHeaderMenus.forEach((index) => {
    order["menus"].push(orders[0][index - 1]);
  });

  return order;
}

/**
 * オーダー内容のメッセージを作成
 * @param order
 * @returns
 */
function createOrderMessage(order) {
  let message = "";

  const orderTime = new Date(order.orderTime);
  const orderedMenuList = getOrderedMenuList(order);

  message += `\n\n
  注文No：${order.orderId}
  受付日時：${orderTime.toLocaleString("ja-JP")}
  お名前：${order.customer}
  電話番号：${order.phone1} (${order.phone2})
  Email：${order.email}`;

  if (orderedMenuList.length > 0) {
    message += `\n\n**注文内容**`;
    orderedMenuList.forEach((menu) => {
      message += `\n\n${menu.name}: ${menu.num}`;
    });
  }

  message += `\n`;
  message += `\n細麵或粗麵：${order.kind}`;
  message += `\n拉麵加麵或咖哩飯/定食加飯（免費）：${order.amount}`;
  message += `\n鹹度：${order.soup}`;

  if (order.comment.length > 0) {
    message += `\n\nその他：${order.comment}`;
  }

  if (order.phone1 != order.phone2) {
    message += `\n\n\n\n＊＊＊＊＊＊＊＊＊＊＊＊`;
    message += `\n【電話番号を確認してください】：${order.phone1} (${order.phone2})`;
    message += `\n＊＊＊＊＊＊＊＊＊＊＊＊`;
  }

  return message;
}

/**
 * オーダーが入ったメニューと個数を取得
 * @param order
 */
function getOrderedMenuList(order) {
  const orderedMenuList = [];

  order.menus.forEach((menu, index) => {
    if (menu > 0) {
      orderedMenuList.push({
        name: Sheet.Order.getRange(1, OrderSheetHeaderMenus[index]).getValue(),
        num: menu,
      });
    }
  });

  return orderedMenuList;
}
