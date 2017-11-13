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

| name        | type    | description                           | required? |
|-------------|---------|---------------------------------------|-----------|
| title       | string  | Title of the new schedule             | yes       |
| location    | string  | Location of appointment               | no        |
| description | string  | Detailed description of this schedule | no        |
| startYear   | integer | The date/time this schedule starts    | yes       |
| startMonth  | 1-12    | The date/time this schedule starts    | yes       |
| startDate   | 1-31    | The date/time this schedule starts    | yes       |
| startHour   | 0-23    | The date/time this schedule starts    | yes       |
| startMinute | 0-59    | The date/time this schedule starts    | yes       |
| endYear     | integer | The date/time this schedule ends      | see below |
| endMonth    | 1-12    | The date/time this schedule ends      | see below |
| endDate     | 1-31    | The date/time this schedule ends      | see below |
| endHour     | 0-23    | The date/time this schedule ends      | see below |
| endMinute   | 0-59    | The date/time this schedule ends      | see below |
| allday      | boolean | All-day event                         | see below |
| labels      | string  |                                       | no        |

If `allday` is set to true, `startHour`, `startMinue`, and all parameters
starting with `end` are ignored and set to `0`, `0`, and the end of the starting
date. Otherwise, `end*` parameters are required and they must represent the
date/time past the starting date/time.

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

| name        | type    | description                           | required? |
|-------------|---------|---------------------------------------|-----------|
| title       | string  | Title of the new schedule             | yes       |
| location    | string  | Location of appointment               | no        |
| description | string  | Detailed description of this schedule | no        |
| startYear   | integer | The date/time this schedule starts    | yes       |
| startMonth  | 1-12    | The date/time this schedule starts    | yes       |
| startDate   | 1-31    | The date/time this schedule starts    | yes       |
| startHour   | 0-23    | The date/time this schedule starts    | yes       |
| startMinute | 0-59    | The date/time this schedule starts    | yes       |
| endYear     | integer | The date/time this schedule ends      | see below |
| endMonth    | 1-12    | The date/time this schedule ends      | see below |
| endDate     | 1-31    | The date/time this schedule ends      | see below |
| endHour     | 0-23    | The date/time this schedule ends      | see below |
| endMinute   | 0-59    | The date/time this schedule ends      | see below |
| allday      | boolean | All-day event                         | see below |
| labels      | string  |                                       | no        |

If `allday` is set to true, `startHour`, `startMinue`, and all parameters
starting with `end` are ignored and set to `0`, `0`, and the end of the starting
date. Otherwise, `end*` parameters are required and they must represent the
date/time past the starting date/time.

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
