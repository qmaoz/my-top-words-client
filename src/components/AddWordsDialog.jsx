import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, List, ListItem, ListItemText, Checkbox, 
  ListItemButton
} from '@mui/material';

const AddWordsDialog = ({ open, handleClose, handleSave, words, selectedWordIds, onToggleWord }) => {
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth
    >
      <DialogTitle>Виберіть слова для набору</DialogTitle>
      
      <DialogContent dividers>
        <List>
          {words?.map((word) => (
            <ListItem 
              key={word.id} 
              disablePadding>
              <ListItemButton 
                onClick={() => onToggleWord(word.id)}>
                <Checkbox
                  edge="start"
                  checked={selectedWordIds.includes(word.id)}
                  tabIndex={-1}
                  disableRipple/>
                <ListItemText
                  primary={word.word_text + ' — ' + word.word_translation_uk}
                  secondary={word.sentence_text + ' — ' + word.sentence_translation_uk} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">Скасувати</Button>
        <Button onClick={handleSave} variant="contained">Зберегти</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWordsDialog;