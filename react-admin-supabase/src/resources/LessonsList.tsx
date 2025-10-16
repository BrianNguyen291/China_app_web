import { List, NumberField, DateField } from 'react-admin';
import ResponsiveDataGrid from '../components/ResponsiveDataGrid';
import { useMediaQuery, useTheme } from '@mui/material';

const LessonsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <List
      perPage={isMobile ? 15 : 30}
      sort={{ field: 'id', order: 'ASC' }}
      title="📖 Quản lý Bài học"
    >
      <ResponsiveDataGrid>
        <NumberField source="id" label="🔢 ID" />
        <NumberField source="level_id" label="📊 Cấp độ" />
        <NumberField source="lesson_number" label="📚 Số bài" />
        <DateField source="created_at" label="📅 Ngày tạo" />
      </ResponsiveDataGrid>
    </List>
  );
};

export default LessonsList;
