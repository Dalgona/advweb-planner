# List of Objects

This document lists all types of objects returned by API endpoints.

## `error` Object

```json
{
  "error": {
    "code": 123,
    "message": "sample error message"
  }
}
```

## `jwt` Object

```json
{
  "token": "aaabbbccc111222333.xxxyyyzzz444555666.foobarbazquux12345"
}
```

## `user` Object

```json
{
  "id": "123",
  "createdAt": "2017-11-07T03:09:36.142Z",
  "modifiedAt": "2017-11-07T03:09:36.142Z",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "verified": true
}
```

## `planner` Object

```json
{
  "id": "123",
  "createdAt": "2017-11-07T03:09:36.142Z",
  "modifiedAt": "2017-11-07T03:09:36.142Z",
  "owner": { },
  "title": "Example Planner"
}
```

### Notes

* `"owner"` property is a `user` object.
* `"owner"` property can be omitted with `stripOwner=true` option on some API
  endpoints.

## `schedule` Object

```json
{
  "id": "123",
  "createdAt": "2017-11-07T03:09:36.142Z",
  "modifiedAt": "2017-11-07T03:09:36.142Z",
  "planner": { },
  "title": "Dinner with Friends",
  "description": "Foo, Bar and Baz are going",
  "location": "Some restaurant",
  "startsAt": "2017-11-07T03:09:36.142Z",
  "endsAt": "2017-11-07T03:09:36.142Z",
  "allDay": false,
  "labels": [ ]
}
```

### Notes

* `"planner"` property is a `planner` object.
* `"labels"` property is a list of `label` objects.
* `"planner"` property can be omitted with `stripPlanner=true` option on some
  API endpoints.

## `todo_list` Object

```json
{
  "id": "123",
  "createdAt": "2017-11-07T03:09:36.142Z",
  "modifiedAt": "2017-11-07T03:09:36.142Z",
  "planner": { },
  "title": "Things to Buy",
  "complete": false,
  "items": [ ]
}
```

### Notes

* `"planner"` property is a `planner` object.
* `"items"` property is a list of `todo_item` objects.
* `"planner"` property can be omitted with `stripPlanner=true` option on some
  API endpoints.

## `todo_item` Object

```json
{
  "id": "123",
  "createdAt": "2017-11-07T03:09:36.142Z",
  "modifiedAt": "2017-11-07T03:09:36.142Z",
  "title": "Replace a light bulb in the kitchen",
  "complete": false
}
```

## `label` Object

```json
{
  "id": "123",
  "createdAt": "2017-11-07T03:09:36.142Z",
  "modifiedAt": "2017-11-07T03:09:36.142Z",
  "title": "Meeting",
  "color": "#FF0000"
}
```
