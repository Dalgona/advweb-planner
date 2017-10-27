# Data Organization

This document lists entities and their properties which will be managed
throughout this project.

## List of Entities

### User (`user`)

Each `user` object represents a person who uses this system.

| Attribute     | Type     | Key |
|---------------|----------|-----|
| `user_id`     | integer  | P   |
| `created_at`  | datetime |     |
| `modified_at` | datetime |     |
| `full_name`   | string   |     |
| `email`       | string   |     |
| `auth`        | string   |     |
| `verified`    | boolean  |     |

### Planner (`planner`)

Each `planner` object represents a planner book which belongs to a specific
user. There must be only one owner for a `planner`, and an owner may have zero
or more `planner`s.

| Attribute     | Type     | Key             |
|---------------|----------|-----------------|
| `planner_id`  | integer  | P               |
| `user_id`     | integer  | F &rarr; `user` |
| `created_at`  | datetime |                 |
| `modified_at` | datetime |                 |
| `title`       | string   |                 |

### Schedule (`schedule`)

Represents a schedule (or appointment) registered in a `planner`.

| Attribute     | Type     | Key                |
|---------------|----------|--------------------|
| `schedule_id` | integer  | P                  |
| `planner_id`  | integer  | F &rarr; `planner` |
| `created_at`  | datetime |                    |
| `modified_at` | datetime |                    |
| `title`       | string   |                    |
| `description` | string   |                    |
| `location`    | string   |                    |
| `starts_at`   | datetime |                    |
| `ends_at`     | datetime |                    |
| `allday`      | boolean  |                    |
| `labels`      | string   |                    |

### To-do List (`todo_list`)

Represents a to-do list registered in a `planner`.

| Attribute      | Type     | Key                |
|----------------|----------|--------------------|
| `todo_list_id` | integer  | P                  |
| `planner_id`   | integer  | F &rarr; `planner` |
| `created_at`   | datetime |                    |
| `modified_at`  | datetime |                    |
| `title`        | string   |                    |
| `complete`     | boolean  |                    |

### To-do List Item (`todo_item`)

Represents each item in a `todo_list`.

| Attribute      | Type     | Key                  |
|----------------|----------|----------------------|
| `todo_item_id` | integer  | P                    |
| `todo_list_id` | integer  | F &rarr; `todo_list` |
| `created_at`   | datetime |                      |
| `modified_at`  | datetime |                      |
| `title`        | string   |                      |
| `complete`     | boolean  |                      |

### Label (`label`)

Represents colored labels each `user` created. Each label is bound to the
context of `user`; If a user created a `label` object, the user can use that
label in any `planner` the `user` owns.

| Attribute     | Type     | Key             |
|---------------|----------|-----------------|
| `label_id`    | integer  | P               |
| `user_id`     | integer  | F &rarr; `user` |
| `created_at`  | datetime |                 |
| `modified_at` | datetime |                 |
| `title`       | string   |                 |
| `color`       | string   |                 |
