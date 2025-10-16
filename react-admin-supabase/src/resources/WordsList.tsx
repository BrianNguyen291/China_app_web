import { List, TextField, NumberField, DateField } from 'react-admin';
import ResponsiveDataGrid from '../components/ResponsiveDataGrid';
import { FilterLiveSearch } from 'react-admin';
import { useMediaQuery, useTheme } from '@mui/material';

const WordsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <List
      filters={[<FilterLiveSearch key="search" source="hanzi" />]}
      perPage={isMobile ? 20 : 50}
      sort={{ field: 'word_id', order: 'ASC' }}
      title="🈶 Quản lý Từ vựng Trung Quốc"
    >
      <ResponsiveDataGrid>
        <NumberField source="word_id" label="🔢 ID" />
        <TextField source="hanzi" label="🈶 Ký tự" />
        <TextField source="radical" label="📝 Bộ thủ" />
        <NumberField source="stroke_count" label="✍️ Số nét" />
        <DateField source="created_at" label="📅 Ngày tạo" showTime />
      </ResponsiveDataGrid>
    </List>
  );
};

export default WordsList;
