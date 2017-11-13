# API Reference &mdash; Schedule Resources

Base URL: `/api`

**TODO:** Accommodate different time zones.

## GET `/planner/:id/schedule`,<br>GET `/planner/:id/schedule/:year`,<br>GET `/planner/:id/schedule/:year/:month`,<br>GET `/planner/:id/schedule/:year/:month/:day`

### Description

Gets a list of schedules saved in the specified planner. This API endpoint
accepts up to three additional parameters in the URL, separated by slashes, to
filter the list by starting date of each schedule.

### Parameters

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

### Response

This API responds with an appropriately filtered list of `schedule` objects
on success.

----------------------------------------------------------------------

## POST `/planner/:id/schedule`

### Description

Adds a new schedule to the specified planner.

### Parameters

Content-Type: `application/x-www-form-urlencoded`

| name        | type     | description                           | required? |
|-------------|----------|---------------------------------------|-----------|
| title       | string   | Title of the new schedule             | yes       |
| location    | string   | Location of appointment               | no        |
| description | string   | Detailed description of this schedule | no        |
| startsAt    | datetime | Starting date of this schedule        | yes       |
| endsAt      | datetime | Ending date of this schedule          | see below |
| allday      | boolean  | All-day event                         | see below |
| labels      | string   |                                       | no        |

* `startsAt` and `endsAt` must be ISO 8601-compliant date/time strings.
* If `allday` is set to true, the `endsAt` parameter is ignored.

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

### Response

This API responds with a new `schedule` object on success.

----------------------------------------------------------------------

## GET `/schedule/:id`

### Description

Gets information of specified schedule.

### Parameters

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

### Response

This API responds with a corresponding `schedule` object on success.

----------------------------------------------------------------------

## PUT `/schedule/:id`

### Description

Modifies information of specified schedule.

### Parameters

Content-Type: `application/x-www-form-urlencoded`

| name        | type     | description                           | required? |
|-------------|----------|---------------------------------------|-----------|
| title       | string   | Title of the new schedule             | yes       |
| location    | string   | Location of appointment               | no        |
| description | string   | Detailed description of this schedule | no        |
| startsAt    | datetime | Starting date of this schedule        | yes       |
| endsAt      | datetime | Ending date of this schedule          | see below |
| allday      | boolean  | All-day event                         | see below |
| labels      | string   |                                       | no        |

* `startsAt` and `endsAt` must be ISO 8601-compliant date/time strings.
* If `allday` is set to true, the `endsAt` parameter is ignored.

Content-Type: `(QUERY STRING)`

| name         | type    | description                             | required? |
|--------------|---------|-----------------------------------------|-----------|
| stripPlanner | boolean | If true, `planner` property is omitted. | no        |
| stripUser    | boolean | See below.                              | no        |

If `stripUser` is true, the `owner` property in the `planner` property is
omitted. This option is effective only if `stripPlanner` is set to false.

### Response

This API responds with an updated `schedule` object on success.

----------------------------------------------------------------------

## DELETE `/schedule/:id`

### Description

Permanently deletes specified schedule.

### Parameters

None.

### Response

This API responds with the following JSON if the deletion was successful:

```json
{
  "message": "schedule deleted"
}
```
