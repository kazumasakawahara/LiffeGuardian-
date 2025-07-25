import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { 
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  EventNote as EventIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          LifeGuardianⅡ
        </Typography>
        <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary">
          意思決定支援システム
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    本人情報
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  基本情報や健康状態を管理
                </Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FamilyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    支援者
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  家族や医療従事者の情報
                </Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    人生の記録
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  重要な出来事や決定事項
                </Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PsychologyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    AI分析
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  意思決定の支援と提案
                </Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            システムについて
          </Typography>
          <Typography variant="body1" paragraph>
            LifeGuardianⅡは、認知症や意思疎通が困難な方々の過去の意思決定、好み、人生の歩みを記録・分析し、
            現在の意思決定を支援するシステムです。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            本人の尊厳を守りながら、適切な支援を提供することを目的としています。
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
