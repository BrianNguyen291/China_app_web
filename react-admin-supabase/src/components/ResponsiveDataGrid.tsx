import { Datagrid } from 'react-admin';
import { Card, CardContent, Typography, Box, useMediaQuery, useTheme } from '@mui/material';

const ResponsiveDataGrid = (props: any) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log('📱 [RESPONSIVE] DataGrid rendered', { 
    isMobile, 
    breakpoint: theme.breakpoints.values.md,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown'
  });

  if (isMobile) {
    console.log('📱 [RESPONSIVE] Using mobile card layout');
    return <ResponsiveCardList {...props} />;
  }

  console.log('💻 [RESPONSIVE] Using desktop table layout');

  return (
    <Datagrid
      sx={{
        width: '100%',
        '& .RaDatagrid-table': {
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
          width: '100%',
          tableLayout: 'auto',
        },
        '& .RaDatagrid-headerCell': {
          padding: { xs: '8px 4px', sm: '10px 6px', md: '12px 8px' },
          fontWeight: 600,
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
        },
        '& .RaDatagrid-rowCell': {
          padding: { xs: '8px 4px', sm: '10px 6px', md: '12px 8px' },
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
        },
        '& .RaDatagrid-root': {
          width: '100%',
          overflow: 'auto',
        },
      }}
      {...props}
    />
  );
};

const ResponsiveCardList = ({ data }: any) => {
  if (!data) return null;

  return (
    <Box sx={{ 
      p: { xs: 0.5, sm: 1, md: 2 },
      height: '100%',
      overflow: 'auto',
      boxSizing: 'border-box',
      width: '100%'
    }}>
      {data.map((record: any) => (
        <Card key={record.id} sx={{ 
          mb: { xs: 1, sm: 1.5, md: 2 }, 
          boxShadow: { xs: 1, sm: 2, md: 2 },
          borderRadius: { xs: 1.5, sm: 2, md: 3 },
          width: '100%'
        }}>
          <CardContent sx={{
            padding: { xs: 1.5, sm: 2, md: 3 },
            '&:last-child': { pb: { xs: 1.5, sm: 2, md: 3 } }
          }}>
            {Object.entries(record)
              .filter(([key]) => key !== 'id')
              .slice(0, 4) // Show only first 4 fields on mobile
              .map(([key, value]: [string, any]) => (
                <Box key={key} sx={{ 
                  mb: { xs: 0.75, sm: 1, md: 1 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 0.25, sm: 0.5, md: 0.5 }
                }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      textTransform: 'capitalize',
                      fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.75rem' },
                      fontWeight: 500
                    }}
                  >
                    {key.replace(/_/g, ' ')}:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                      wordBreak: 'break-word'
                    }}
                  >
                    {formatFieldValue(value)}
                  </Typography>
                </Box>
              ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const formatFieldValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toLocaleDateString();
    return JSON.stringify(value);
  }
  return String(value);
};

export default ResponsiveDataGrid;
