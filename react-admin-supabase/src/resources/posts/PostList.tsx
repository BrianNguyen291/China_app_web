import { List, Datagrid, TextField, SimpleList } from 'react-admin'
import { useMediaQuery } from '@mui/material'

export default function PostList() {
  const isSmall = useMediaQuery('(max-width:600px)')

  return (
    <List>
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.title ?? `#${record.id}`}
          secondaryText={(record) => (record.body ? String(record.body).slice(0, 60) : '')}
          linkType="show"
        />
      ) : (
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="title" />
          <TextField source="body" />
        </Datagrid>
      )}
    </List>
  )
}


