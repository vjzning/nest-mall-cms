# Mall Order Admin Module Implementation Plan

## 1. Database Schema Updates (`libs/db/src/entities/mall-order.entity.ts`)

To support logistics information and better status tracking, we need to enhance the `MallOrderEntity`.

### 1.1 Add Logistics Columns
Add the following columns to `MallOrderEntity`:
- `delivery_company` (varchar): The logistics carrier name (e.g., SF Express, DHL).
- `delivery_sn` (varchar): The tracking number.
- `delivery_time` (datetime): When the order was shipped.

### 1.2 Update Order Status Enum
Current Enum: `PENDING_PAY`, `PENDING_DELIVERY`, `DELIVERED`, `COMPLETED`, `CANCELLED`.
*Ambiguity*: `DELIVERED` usually means the customer received it. We need a state for "Shipped/In Transit".
**proposal**:
- Add `SHIPPED` status.
- Workflow: `PENDING_DELIVERY` -> (Admin ships) -> `SHIPPED` -> (User receives) -> `RECEIVED` (or keep `DELIVERED` as received) -> `COMPLETED`.

## 2. Admin API Implementation (`apps/cms-admin-api/src/mall/order/`)

### 2.1 Order List (`GET /mall/orders`)
**Features**:
- Pagination (page, pageSize).
- Filters:
  - `orderNo` (Partial match)
  - `status` (Enum)
  - `memberId` (Exact)
  - `createTime` range.
- **Implementation**: create `QueryOrderDto`.

### 2.2 Order Details (`GET /mall/orders/:id`)
**Enhancements**:
- Fetch Order Items (`items` relation).
- Fetch Payment Info: Query `MallPaymentEntity` using `orderNo` and attach it to the response.
- Format `receiverInfo` (ensure it's typed or clear).

### 2.3 Order Shipping (`POST /mall/orders/:id/delivery`)
**Changes**:
- Input: `DeliveryOrderDto` (`deliveryCompany`, `deliverySn`).
- Logic:
  - Verify status is `PENDING_DELIVERY`.
  - Update `deliveryCompany`, `deliverySn`, `deliveryTime`.
  - Update status to `SHIPPED` (or `DELIVERED` depending on final Enum choice).
  - Save order.

## 3. Workflow Summary
1.  **Modify Entity**: Add columns and update Enum.
2.  **Service Layer**:
    - `findAll`: Apply filters.
    - `findOne`: Join Payment table.
    - `delivery`: Implement shipping logic.
3.  **Controller Layer**: Update endpoints to use new DTOs.
