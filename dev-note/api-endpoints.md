# List of API Endpoints

Base URL: `/api`

## Accessing User Resources

* `POST` `/user` -- Create a new user account
* `GET` `/user/[id]` -- Get information about the current user
* `PUT` `/user/[id]` -- Update user information
* `DELETE` `/user/[id]` -- Permanently delete the current user account

## Accessing Planner Resources

* `GET` `/planner` -- Get a list of planners the user owns
* `POST` `/planner` -- Create a new planner
* `GET` `/planner/[id]` -- Get information about selected planner
* `PUT` `/planner/[id]` -- Modify information or settings of selected planner
* `DELETE` `/planner/[id]` -- Permanently delete selected planner
  and its contents

## Accessing Schedule Resources

Following resources return a (possibly empty) list of schedules registered in
the selected planner. The second through fourth form will be mainly used. The
first one shall return a list of *all* schedules, otherwise filtered by
arguments specified in the *query string*.

* `GET` `/planner/[id]/schedules`
* `GET` `/planner/[id]/schedules/[year]`
* `GET` `/planner/[id]/schedules/[year]/[month]`
* `GET` `/planner/[id]/schedules/[year]/[month]/[day]`

### Other Schedule Resources

* `POST` `/planner/[id]/schedule` -- Create a new schedule in selected planner
* `GET` `/schedule/[id]` -- Get information of single schedule
* `PUT` `/schedule/[id]` -- Modify selected schedule
* `DELETE` `/schedule/[id]` -- Permanently delete selected schedule

## Accessing To-do List Resources

### Accessing a List Itself

* `GET` `/planner/[id]/todo-lists` -- Get a list of all to-do lists in
  specified planner
* `POST` `/planner/[id]/todo-list` -- Create a new empty to-do list
* `GET` `/todo-list/[id]` -- Get information of single to-do list (with complete
  list of to-do list items)
* `PUT` `/todo-list/[id]` -- Modify information of specified to-do list
* `DELETE` `/todo-list/[id]` -- Permanently delete selected to-do list

### Accessing Contents of a List

* `POST` `/todo-list/[id]/item` -- Append an item to specified to-do list
* `GET` `/todo-item/[id]` -- Get information of single to-do list item
* `PUT` `/todo-item/[id]` -- Modify information of specified to-do list item
* `DELETE` `/todo-item/[id]` -- Permanently delete specified to-do list item

## Accessing Label Resources

* `GET` `/labels` -- Get a list of all labels for the current user
* `POST` `/label` -- Create a new label
* `GET` `/label/[id]` -- Get information of single label
* `PUT` `/label/[id]` -- Modify specified label
* `DELETE` `/label/[id]` -- Permanently delete specified label

## Lexicographical Order

| Endpoint | Available Method(s) |
|-|-|
| `/label` | POST |
| `/label/[id]` | GET, PUT, DELETE |
| `/labels` | GET |
| `/planner` | GET, POST |
| `/planner/[id]` | GET, PUT, DELETE |
| `/planner/[id]/schedule` | POST |
| `/planner/[id]/schedules` | GET |
| `/planner/[id]/schedules/[year]` | GET |
| `/planner/[id]/schedules/[year]/[month]` | GET |
| `/planner/[id]/schedules/[year]/[month]/[day]` | GET |
| `/planner/[id]/todo-list` | POST |
| `/planner/[id]/todo-lists` | GET |
| `/schedule/[id]` | GET, PUT, DELETE |
| `/todo-item/[id]` | GET, PUT, DELETE |
| `/todo-list/[id]` | GET, PUT, DELETE |
| `/todo-list/[id]/item` | POST |
| `/user` | POST |
| `/user/[id]` | GET, PUT, DELETE |
