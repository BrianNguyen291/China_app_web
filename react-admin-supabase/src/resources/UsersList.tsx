import { List, TextField, DateField, BooleanField, ChipField } from 'react-admin';
import ResponsiveDataGrid from '../components/ResponsiveDataGrid';
import { FilterLiveSearch, FilterList, FilterListItem } from 'react-admin';
import { useMediaQuery, useTheme } from '@mui/material';

const UsersList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const filters = [
    <FilterLiveSearch key="search" source="display_name" />,
    <FilterList label="Subscription Tier" icon={null}>
      <FilterListItem label="Free" value={{ subscription_tier: 'free' }} />
      <FilterListItem label="Pro" value={{ subscription_tier: 'pro' }} />
    </FilterList>,
    <FilterList label="Status" icon={null}>
      <FilterListItem label="Active" value={{ is_active: true }} />
      <FilterListItem label="Inactive" value={{ is_active: false }} />
    </FilterList>,
  ];

  return (
    <List
      filters={isMobile ? [filters[0]] : filters}
      perPage={isMobile ? 10 : 25}
      sort={{ field: 'created_at', order: 'DESC' }}
      title="👥 Quản lý Người dùng"
    >
      <ResponsiveDataGrid>
        <TextField source="email" label="📧 Email" />
        <TextField source="display_name" label="👤 Tên hiển thị" />
        <ChipField 
          source="subscription_tier" 
          label="💎 Gói dịch vụ"
          sx={{
            '& .MuiChip-root': {
              backgroundColor: (record: any) => 
                record?.subscription_tier === 'pro' ? '#1976d2' : '#757575',
              color: 'white',
              fontWeight: 500,
            },
          }}
        />
        <BooleanField 
          source="is_active" 
          label="✅ Trạng thái"
          sx={{
            '& .MuiChip-root': {
              backgroundColor: (record: any) => 
                record?.is_active ? '#2e7d32' : '#d32f2f',
              color: 'white',
            },
          }}
        />
        <BooleanField 
          source="is_email_verified" 
          label="📧 Xác thực"
          sx={{
            '& .MuiChip-root': {
              backgroundColor: (record: any) => 
                record?.is_email_verified ? '#2e7d32' : '#ed6c02',
              color: 'white',
            },
          }}
        />
        <DateField source="created_at" label="📅 Ngày tạo" showTime />
        <DateField source="last_login_at" label="🕐 Lần đăng nhập cuối" showTime />
      </ResponsiveDataGrid>
    </List>
  );
};

export default UsersList;
