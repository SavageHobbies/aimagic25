import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Tooltip,
    Chip,
    Box,
    Typography,
    LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { styled } from '@mui/material/styles';

const ConfidenceBar = styled(LinearProgress)(({ theme }) => ({
    height: 8,
    borderRadius: 4,
    '& .MuiLinearProgress-bar': {
        borderRadius: 4,
    }
}));

interface ItemSpecificsBulkEditorProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: { [key: string]: string }) => void;
    aspects: any[];
    currentValues: { [key: string]: string };
    aiSuggestions: {
        [key: string]: {
            value: string;
            confidence: number;
            source: string;
        }
    };
    onRefreshSuggestion: (aspectName: string) => Promise<void>;
}

export default function ItemSpecificsBulkEditor({
    open,
    onClose,
    onSave,
    aspects,
    currentValues,
    aiSuggestions,
    onRefreshSuggestion
}: ItemSpecificsBulkEditorProps) {
    const [editedValues, setEditedValues] = useState<{ [key: string]: string }>(currentValues);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

    const handleValueChange = (aspectName: string, value: string) => {
        setEditedValues(prev => ({
            ...prev,
            [aspectName]: value
        }));
    };

    const handleAcceptSuggestion = (aspectName: string) => {
        if (aiSuggestions[aspectName]) {
            handleValueChange(aspectName, aiSuggestions[aspectName].value);
        }
    };

    const handleRefreshSuggestion = async (aspectName: string) => {
        setLoading(prev => ({ ...prev, [aspectName]: true }));
        await onRefreshSuggestion(aspectName);
        setLoading(prev => ({ ...prev, [aspectName]: false }));
    };

    const handleSave = () => {
        onSave(editedValues);
        onClose();
    };

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'title':
                return 'primary';
            case 'description':
                return 'secondary';
            case 'previous_values':
                return 'success';
            case 'ai_generated':
                return 'default';
            default:
                return 'default';
        }
    };

    const getSourceLabel = (source: string) => {
        switch (source) {
            case 'title':
                return 'From Title';
            case 'description':
                return 'From Description';
            case 'previous_values':
                return 'From History';
            case 'ai_generated':
                return 'AI Generated';
            default:
                return 'Unknown';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                Bulk Edit Item Specifics
                <Typography variant="subtitle2" color="textSecondary">
                    Review and edit AI-suggested values
                </Typography>
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Aspect Name</TableCell>
                                <TableCell>Current Value</TableCell>
                                <TableCell>AI Suggestion</TableCell>
                                <TableCell>Confidence</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {aspects.map((aspect) => {
                                const suggestion = aiSuggestions[aspect.name] || {};
                                const isLoading = loading[aspect.name];
                                
                                return (
                                    <TableRow key={aspect.name}>
                                        <TableCell>
                                            {aspect.name}
                                            {aspect.required && (
                                                <Chip
                                                    size="small"
                                                    label="Required"
                                                    color="error"
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editedValues[aspect.name] || ''}
                                                onChange={(e) => handleValueChange(aspect.name, e.target.value)}
                                                error={aspect.required && !editedValues[aspect.name]}
                                            />
                                        </TableCell>
                                        <TableCell>{suggestion.value || ''}</TableCell>
                                        <TableCell>
                                            {suggestion.confidence !== undefined && (
                                                <Box sx={{ width: '100%' }}>
                                                    <ConfidenceBar
                                                        variant="determinate"
                                                        value={suggestion.confidence * 100}
                                                        color={suggestion.confidence > 0.7 ? "success" : "warning"}
                                                    />
                                                    <Typography variant="caption">
                                                        {Math.round(suggestion.confidence * 100)}%
                                                    </Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {suggestion.source && (
                                                <Chip
                                                    size="small"
                                                    label={getSourceLabel(suggestion.source)}
                                                    color={getSourceColor(suggestion.source)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Accept AI Suggestion">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleAcceptSuggestion(aspect.name)}
                                                    disabled={!suggestion.value}
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Get New Suggestion">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRefreshSuggestion(aspect.name)}
                                                    disabled={isLoading}
                                                >
                                                    <AutoFixHighIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
