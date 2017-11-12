# API Reference &mdash; Label Resources

Base URL: `/api`

Boolean values in a query string: `"true"` is truthy. Anything else is falsey.

## GET `/label`

### Description

Gets a list of labels the current user owns.

This API **REQUIRES** a user token.

### Parameters

None.

### Response

This API responds with a list of `label` objects on success.

----------------------------------------------------------------------

## POST `/label`

### Description

Creates a new label belonging to the current user.

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| name  | type                       | description          | required?      |
|-------|----------------------------|----------------------|----------------|
| title | string                     | Title of a new label | yes            |
| color | string `/#[0-9A-Fa-f]{6}/` | Label color          | no (`#808080`) |

If the value of `color` does not match the regex, the default value will be
inserted instead.

### Response

This API responds with a new `label` object on success.

----------------------------------------------------------------------

## GET `/label/:id`

### Description

Gets information about selected label.

This API **REQUIRES** a user token.

### Parameters

None.

### Response

This API responds with a corresponding `label` object on success.

----------------------------------------------------------------------

## PUT `/label/:id`

### Description

Modifies information of selected label.

This API **REQUIRES** a user token.

### Parameters

Content-type: `application/x-www-form-urlencoded`

| name  | type                       | description          | required? |
|-------|----------------------------|----------------------|-----------|
| title | string                     | Title of a new label | no        |
| color | string `/#[0-9A-Fa-f]{6}/` | Label color          | no        |

If the value of `color` does not match the regex, label color will remain
unchanged.

### Response

This API responds with an updated `label` object on success.

----------------------------------------------------------------------

## DELETE `/label/:id`

### Description

Permanently deletes selected label. This label will be removed from all
`schedule` object.

This API **REQUIRES** a user token.

### Parameters

None.

### Response

This API responds with the following JSON on success:

```json
{
  "message": "label deleted"
}
```
