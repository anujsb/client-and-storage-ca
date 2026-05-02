const xlsx = require("xlsx");

const data = [
  {
    "Party Name": "Reliance Industries",
    "PAN Number": "ABCDE1234F",
    "Contact No": "9876543210",
    "Email ID": "contact@ril.com",
    "Office Address": "Mumbai India",
    "Notes": "VIP Client",
    "Subscriptions": "GST, ITR"
  },
  {
    "Party Name": "Tata Motors",
    "PAN Number": "VWXYZ9876G",
    "Contact No": "9988776655",
    "Email ID": "info@tata.com",
    "Office Address": "Pune India",
    "Notes": "Auto division",
    "Subscriptions": "GST, TDS"
  },
  {
    "Party Name": "Infosys",
    "PAN Number": "QWERT5432H",
    "Contact No": "9998887776",
    "Email ID": "",
    "Office Address": "Bangalore",
    "Notes": "IT Services",
    "Subscriptions": "ITR"
  },
  {
    "Party Name": "Wipro Ltd",
    "PAN Number": "ZXCVB1234K",
    "Contact No": "1234567890",
    "Email ID": "contact@wipro.com",
    "Office Address": "Bangalore",
    "Notes": "",
    "Subscriptions": ""
  },
  {
    "Party Name": "Test Client without PAN",
    "PAN Number": "",
    "Contact No": "1112223334",
    "Email ID": "test@test.com",
    "Office Address": "Delhi",
    "Notes": "Should generate random PAN",
    "Subscriptions": "GST"
  }
];

const worksheet = xlsx.utils.json_to_sheet(data);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Clients");

xlsx.writeFile(workbook, "test_clients.xlsx");
console.log("test_clients.xlsx created successfully!");
