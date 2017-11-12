# API Reference &mdash; To-do List Item Resources

Base URL: `/api`

## POST `/todo-list/:id/item`

### Description

Appends a new list item in the selected to-do list.

### Paramenters

Content-Type: `application/x-www-form-urlencoded`

| name  | type   | description                | required? |
|-------|--------|----------------------------|-----------|
| title | string | Title of the new list item | yes       |

### Response

This API responds with a new `todo_item` object on success.

----------------------------------------------------------------------

## GET `/todo-item/:id`

### Description

Gets information of specified list item.

### Paramenters

None.

### Response

This API responds with a corresponding `todo_item` object on success.

----------------------------------------------------------------------

## PUT `/todo-item/:id`

### Description

Modifies information of selected list item.

### Paramenters

Content-Type: `application/x-www-form-urlencoded`

| name     | type    | description                | required? |
|----------|---------|----------------------------|-----------|
| title    | string  | New Title of the list item | no        |
| complete | boolean | Show as a completed task?  | no        |

### Response

This API responds with an updated `todo_item` object on success.

----------------------------------------------------------------------

## DELETE `/todo-item/:id`

### Description

Permanently deletes specified list item.

### Paramenters

None.

### Response

This API responds with the following JSON if deletion was successful:

```json
{
  "message": "to-do list item deleted"
}
```
