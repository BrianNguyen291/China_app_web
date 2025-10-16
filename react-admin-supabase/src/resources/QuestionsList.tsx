import { List, TextField, NumberField, DateField, TextInput } from 'react-admin';
import ResponsiveDataGrid from '../components/ResponsiveDataGrid';
import { useMediaQuery, useTheme } from '@mui/material';

const QuestionsList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <List
      filters={[
        <TextInput key="search" source="prompt" label="Tìm kiếm câu hỏi" alwaysOn />
      ]}
      perPage={isMobile ? 15 : 30}
      sort={{ field: 'id', order: 'ASC' }}
      title="❓ Quản lý Câu hỏi"
    >
      <ResponsiveDataGrid>
        <TextField source="id" label="🔢 ID" />
        <NumberField source="lesson_id" label="📚 Bài học" />
        <TextField source="prompt" label="❓ Câu hỏi" />
        <NumberField source="correct_index" label="✅ Đáp án đúng" />
        <NumberField source="time" label="⏱️ Thời gian (giây)" />
        <DateField source="created_at" label="📅 Ngày tạo" />
      </ResponsiveDataGrid>
    </List>
  );
};

export default QuestionsList;
