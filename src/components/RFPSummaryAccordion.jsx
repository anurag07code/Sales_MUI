import React, { useState } from "react";
import * as icons from "lucide-react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const RFPSummaryAccordion = ({
  tabs
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(`item-0`);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        RFP Summary
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {tabs.map((tab, index) => {
          const IconComponent = icons[tab.icon];
          const panelId = `item-${index}`;
          const isExpanded = expanded === panelId;
          
          return (
            <Accordion
              key={index}
              expanded={isExpanded}
              onChange={handleChange(panelId)}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:before': { display: 'none' },
                boxShadow: 1
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 3,
                  py: 2,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.grey[800], 0.5)
                      : alpha(theme.palette.grey[200], 0.5)
                  },
                  transition: 'background-color 0.3s',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1.5
                  }
                }}
              >
                {IconComponent && (
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <IconComponent size={20} style={{ color: theme.palette.primary.main }} />
                  </Box>
                )}
                <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {tab.title}
                </Typography>
                <Chip
                  label={`(${tab.sections.length})`}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 20,
                    bgcolor: 'transparent',
                    color: 'text.secondary'
                  }}
                />
              </AccordionSummary>
              
              <AccordionDetails sx={{ px: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  {tab.sections.map((section, sectionIndex) => (
                    <Card
                      key={sectionIndex}
                      sx={{
                        p: 2,
                        bgcolor: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.grey[800], 0.3)
                          : alpha(theme.palette.grey[200], 0.3),
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: 'primary.main'
                        }}
                      >
                        {section.heading}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.75 }}
                      >
                        {section.content}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};
export default RFPSummaryAccordion;