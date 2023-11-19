# Software-Development-Refactoring-submission

## requirements
#### Library Management System:

A certain online bookstore has a large number of books, all of which can support borrowing and selling.

Book information mainly includes number, name, author, publisher, price, and quantity.

The bookstore must be registered as a member to log in. Members can recharge, consume, and modify their own information.

Member information includes account, name, password, level, registration time, and amount.

Ordinary members become gold members when spending up to 1000. Become a platinum member when spending up to 10000 yuan. There is no discount for regular members to purchase and borrow books, with a 10% discount for gold members and a 20% discount for platinum members.

Members can log in to the system to browse, query, purchase, borrow, and return books.

The shop assistant can perform operations such as querying and counting books, listing and removing books, and modifying books.

The shop assistant can conduct relevant statistical work on orders and sales.

## How to run

execute `ts-node main.ts` to run test.

Or run `tsc main.ts && node main`

if you use tsc, compile it into js file and run it.