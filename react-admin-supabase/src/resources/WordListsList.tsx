import { List, TextField, DateField, BooleanField } from 'react-admin';
import ResponsiveDataGrid from '../components/ResponsiveDataGrid';
import { FilterLiveSearch } from 'react-admin';
import { useMediaQuery, useTheme } from '@mui/material';

const WordListsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <List
      filters={[<FilterLiveSearch key="search" source="title" />]}
      perPage={isMobile ? 10 : 25}
      sort={{ field: 'created_at', order: 'DESC' }}
      title="📚 Quản lý Danh sách Từ vựng"
    >
      <ResponsiveDataGrid>
        <TextField source="title" label="📝 Tiêu đề" />
        <BooleanField 
          source="is_public" 
          label="🌍 Công khai"
          sx={{
            '& .MuiChip-root': {
              backgroundColor: (record: any) => 
                record?.is_public ? '#2e7d32' : '#757575',
              color: 'white',
            },
          }}
        />
        <DateField source="created_at" label="📅 Ngày tạo" showTime />
      </ResponsiveDataGrid>
    </List>
  );
};

export default WordListsList;
