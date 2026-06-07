import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';

import { selectIsAuth, selectUserData } from '../redux/slices/auth';
import WordSearchBlock from '../components/WordSearchBlock';
import { deleteWordSet, fetchWordSet, toggleWordSetSave, updateWordSet } from '../redux/slices/word-sets';
import { ErrorMessage, Toast } from '../components/utils/messages';
import FormInput from '../components/form/FormInput';
import WordSetName from '../components/wrappers/WordSetName';
import CircularLoading from '../components/wrappers/CircularLoading';
import SaveForLearningButton from '../components/wrappers/SaveForLearningButton';
import { Box, Typography } from '@mui/material';
import CreateNewWordForm from './Profile/components/CreateNewWordForm';

export default function WordSetPage() {
  const { id: wordSetId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const userData = useSelector(selectUserData);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const handleCloseToast = () => setToast({ ...toast, open: false });
  
  const { activeItem , activeItemStatus } = useSelector((state) => state.wordSets);
  const isOwnWordSet = activeItem && userData && activeItem?.owner_user_id == userData?.id;
  const totalWords = activeItem?.words?.length || 0;

  const isSavedForLearning = activeItem?.isSavedForLearning || false;
  
  const navigateBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleToggleSave = async () => {
    try {
      const data = await dispatch(toggleWordSetSave({ id: wordSetId })).unwrap();
      
      if (!data) {
        setToast({ open: true, message: 'Сталася помилка', severity: 'error' });
      }
    } catch (error) {
      setToast({ open: true, message: error?.message?.message || error?.message || 'Сталася помилка', severity: 'error' });
    }
  };

  const handleToggleIsPublic = async () => {
    if (isOwnWordSet) {
      if (window.confirm('Підтверджуєте зміну публічного статусу свого набору?')) {
        try {
          const data = await dispatch(updateWordSet({ id: wordSetId, setIsPublic: !activeItem?.is_public })).unwrap();
          if (!data) {
            setToast({ open: true, message: 'Не вдалося змінити статус набору. Ймовірно, сталася помилка', severity: 'error' });
          }
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Не вдалося змінити статус набору. Ймовірно, сталася помилка', severity: 'error' });
        }
      }
    }
  };

  const handleDeleteWordSet = async () => {
    if (isOwnWordSet) {
      if (window.confirm('Підтверджуєте видалення свого набору?')) {
        try {
          const data = await dispatch(deleteWordSet(wordSetId)).unwrap();
          if (!data) {
            return setToast({ open: true, message: 'Не вдалося видалити набір. Ймовірно, сталася помилка', severity: 'error' });
          }
          navigateBack();
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Не вдалося видалити набір. Ймовірно, сталася помилка', severity: 'error' });
        }
      }
    }
  };

  const [ isEditing, setIsEditing ] = useState(false);  
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      word_set_name: activeItem?.name
    },
    mode: 'onSubmit'
  });

  useEffect(() => {
    if (activeItem) {
      reset({
        word_set_name: activeItem?.name
      });
    }
  }, [activeItem, reset]);

  const setWordSetEditingTrue = () => {
    if (isOwnWordSet && !isEditing) {
      setIsEditing(true);
    }
  };

  const setWordSetEditingFalse = () => {
    if (isOwnWordSet && isEditing) {
      setIsEditing(false);
    }
  };

  const onWordSetNameChange = async (values) => {
    if (isOwnWordSet) {
      if (values.word_set_name.trim() != activeItem.name) {
        try {
          const data = await dispatch(updateWordSet({ id: wordSetId, name: values.word_set_name.trim() })).unwrap();
          if (!data) {
            return setToast({ open: true, message: 'Не вдалося оновити набір. Ймовірно, сталася помилка', severity: 'error' });
          }
          reset();
        } catch (error) {
          setToast({ open: true, message: error?.message?.message || error?.message || 'Не вдалося оновити набір. Ймовірно, сталася помилка', severity: 'error' });
        }
      }
      setWordSetEditingFalse();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchWordSet(wordSetId)).unwrap();
      } catch (error) {
        setToast({ open: true, message: error?.message?.message || error?.message || 'Помилка під час завантаження набору', severity: 'error' });
      }
    })();
  }, [dispatch, wordSetId]);
  
  return (
    <>
      <Box className="word-set-page container">
        <CircularLoading isLoading={activeItemStatus === 'loading'}>
          {!activeItem || activeItemStatus === 'error' ? (
            <ErrorMessage message={'Набір не знайдено або доступ до нього заборонено, або стався збій'} />
          ) :
            <>
              {activeItemStatus === 'loaded' &&
                <form className="word-set-page-header df g-3 mb-3" onSubmit={handleSubmit(onWordSetNameChange)}>
                  {!isEditing ? <>
                    <WordSetName name={activeItem?.name} maxLength={24} />
                  </> : <>
                    <FormInput
                      name="word_set_name"
                      label="Назва набору"
                      register={register}
                      errors={errors}
                      required
                      maxLength={30}
                      className="word-set-name-input"
                    />
                  </>}

                  <Box className="word-set-page-header__right">
                    {activeItem && isAuth && <>
                      {!isEditing &&
                        <SaveForLearningButton isSavedForLearning={isSavedForLearning} handleToggleSave={handleToggleSave} big />
                      }
                      {isOwnWordSet &&
                        <>
                          {!isEditing && <>
                            <Box className='toggle-public-btn'>
                              {activeItem?.is_public ? <>
                                <IconButton onClick={handleToggleIsPublic} title='Зробити набір приватним' color="success" disabled={isEditing} >
                                  <PublicIcon className='mui-btn' />
                                </IconButton>
                              </> : <>
                                <IconButton onClick={handleToggleIsPublic} title='Зробити набір публічним' color="error" disabled={isEditing} >
                                  <PublicOffIcon className='mui-btn' />
                                </IconButton>
                              </>}
                            </Box>
                          </>}
                          <IconButton onClick={handleDeleteWordSet} title='Видалити набір' aria-label="delete" color="error" >
                            <DeleteIcon className='mui-btn' />
                          </IconButton>

                          {!isEditing && <>
                            <IconButton onClick={setWordSetEditingTrue} title='Редагувати набір' aria-label="edit" color="primary" >
                              <EditIcon className='mui-btn' />
                            </IconButton> 
                          </>}
                          {isEditing && <>
                            <IconButton type='submit' title='Зберегти зміни' aria-label="save" color="success" >
                              <SaveIcon className='mui-btn' />
                            </IconButton> 
                          </>
                          }
                        </>
                      }
                    </>
                    }
                  </Box>
                </form>
              }
              {!isEditing && activeItemStatus === 'loaded' && totalWords > 0 && <>
                <Box sx={{ boxShadow: 2 }} className='mb-3 rounded'>
                  <Link to={`/translate-exercise/${wordSetId}`} className="exercise-card rounded">
                    {/* <!--!Font Awesome Free 7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}
                    <svg className="exercise-logo" alt="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor"><path d="M192 64C209.7 64 224 78.3 224 96L224 128L352 128C369.7 128 384 142.3 384 160C384 177.7 369.7 192 352 192L342.4 192L334 215.1C317.6 260.3 292.9 301.6 261.8 337.1C276 345.9 290.8 353.7 306.2 360.6L356.6 383L418.8 243C423.9 231.4 435.4 224 448 224C460.6 224 472.1 231.4 477.2 243L605.2 531C612.4 547.2 605.1 566.1 589 573.2C572.9 580.3 553.9 573.1 546.8 557L526.8 512L369.3 512L349.3 557C342.1 573.2 323.2 580.4 307.1 573.2C291 566 283.7 547.1 290.9 531L330.7 441.5L280.3 419.1C257.3 408.9 235.3 396.7 214.5 382.7C193.2 399.9 169.9 414.9 145 427.4L110.3 444.6C94.5 452.5 75.3 446.1 67.4 430.3C59.5 414.5 65.9 395.3 81.7 387.4L116.2 370.1C132.5 361.9 148 352.4 162.6 341.8C148.8 329.1 135.8 315.4 123.7 300.9L113.6 288.7C102.3 275.1 104.1 254.9 117.7 243.6C131.3 232.3 151.5 234.1 162.8 247.7L173 259.9C184.5 273.8 197.1 286.7 210.4 298.6C237.9 268.2 259.6 232.5 273.9 193.2L274.4 192L64.1 192C46.3 192 32 177.7 32 160C32 142.3 46.3 128 64 128L160 128L160 96C160 78.3 174.3 64 192 64zM448 334.8L397.7 448L498.3 448L448 334.8z"/></svg>
                    <Typography variant='h5' component='h3' >Потренуватися в тренажері на переклад</Typography>
                  </Link>
                </Box>
              </>}
              {activeItemStatus === 'loaded' && <>
                {isEditing &&
                  <CreateNewWordForm />
                }
                <WordSearchBlock words={activeItem?.words} isEditing={isEditing} />
              </>}
            </>}
        </CircularLoading>
      </Box>

      <Toast {...toast} handleClose={handleCloseToast} />
    </>
  );
}