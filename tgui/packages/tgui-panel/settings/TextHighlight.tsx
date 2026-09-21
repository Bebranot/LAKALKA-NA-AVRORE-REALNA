import { useMemo } from 'react';
import {
  Box,
  Button,
  ColorBox,
  Divider,
  Icon,
  Input,
  Section,
  Slider,
  Stack,
  TextArea,
} from 'tgui-core/components';
import { toFixed } from 'tgui-core/math';
import { chatRenderer } from '../chat/renderer';
import { WARN_AFTER_HIGHLIGHT_AMT } from './constants';
import { useHighlights } from './use-highlights';

export function TextHighlightSettings(props) {
  const {
    highlights: { highlightSettings },
    addHighlight,
  } = useHighlights();

  return (
    <Section fill scrollable height="250px">
      <Stack vertical>
        {highlightSettings.map((id, i) => (
          <TextHighlightSetting
            key={i}
            id={id}
            mb={i + 1 === highlightSettings.length ? 0 : '10px'}
          />
        ))}
        <Stack.Item>
          <Box>
            <Button
              color="transparent"
              icon="plus"
              onClick={() => addHighlight()}
            >
              Добавить подсветку
            </Button>
            {highlightSettings.length >= WARN_AFTER_HIGHLIGHT_AMT && (
              <Box inline fontSize="0.9em" ml={1} color="red">
                <Icon mr={1} name="triangle-exclamation" />
                Много правил подсветки может снизить производительность!
              </Box>
            )}
          </Box>
        </Stack.Item>
      </Stack>
      <Divider />
      <Box>
        <Button icon="check" onClick={() => chatRenderer.rebuildChat()}>
          Применить
        </Button>
        <Box inline fontSize="0.9em" ml={1} color="label">
          Может ненадолго подвесить чат.
        </Box>
      </Box>
    </Section>
  );
}

const oneCharacterRegex = /^(\[.*\]|\\.|.)$/;

function extractRegex(highlight: string): string | null {
  if (
    highlight.charAt(0) !== '/' ||
    highlight.charAt(highlight.length - 1) !== '/'
  ) {
    return null;
  }
  const expr = highlight.substring(1, highlight.length - 1);
  if (oneCharacterRegex.test(expr)) {
    return null;
  }
  return expr;
}

function TextHighlightSetting(props) {
  const { id, ...rest } = props;
  const {
    highlights: { highlightSettingById },
    updateHighlight,
    removeHighlight,
  } = useHighlights();
  const {
    backgroundHighlightColor,
    backgroundHighlightOpacity,
    enabled,
    highlightColor,
    highlightText,
    highlightWholeMessage,
    matchWord,
    matchCase,
  } = highlightSettingById[id];

  const highlightRegex = useMemo(
    () => extractRegex(highlightText),
    [highlightText],
  );

  const isRegexValid = useMemo(() => {
    if (!highlightRegex) return true;
    try {
      new RegExp(highlightRegex, 'g');
      return true;
    } catch {
      return false;
    }
  }, [highlightRegex]);

  return (
    <Stack.Item {...rest}>
      <Stack mb={1} color="label" align="baseline">
        <Stack.Item grow>
          <Button.Checkbox
            checked={!!enabled}
            mr="5px"
            onClick={() =>
              updateHighlight({
                id,
                enabled: !enabled,
              })
            }
          >
            Включено
          </Button.Checkbox>
          <Button
            color="transparent"
            icon="times"
            onClick={() => removeHighlight(id)}
          >
            Удалить
          </Button>
        </Stack.Item>
        {highlightWholeMessage && (
          <Stack.Item>
            <Stack align="center">
              <Stack.Item>
                <Slider
                  width="7em"
                  step={1}
                  stepPixelSize={5}
                  minValue={1}
                  maxValue={100}
                  unit="%"
                  value={backgroundHighlightOpacity}
                  format={(value) => toFixed(value)}
                  onChange={(_, value) =>
                    updateHighlight({
                      id,
                      backgroundHighlightOpacity: value,
                    })
                  }
                />
              </Stack.Item>
              <Stack.Item>
                <ColorBox mr={1} color={backgroundHighlightColor} />
                <Input
                  mr={1}
                  width="5em"
                  monospace
                  placeholder="#ffdd44"
                  value={backgroundHighlightColor}
                  onBlur={(value) =>
                    updateHighlight({
                      id,
                      backgroundHighlightColor: value,
                    })
                  }
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>
        )}
        <Stack.Item>
          <Button.Checkbox
            checked={highlightWholeMessage}
            tooltip="Подсвечивает всё сообщение целиком выбранным цветом"
            onClick={() =>
              updateHighlight({
                id,
                highlightWholeMessage: !highlightWholeMessage,
              })
            }
          >
            Всё сообщение
          </Button.Checkbox>
        </Stack.Item>
        <Stack.Item>
          <Button.Checkbox
            checked={matchWord}
            tooltipPosition="bottom-start"
            tooltip="Только точные совпадения, без лишних букв вокруг. Не работает со знаками препинания, игнорируется при использовании regex"
            disabled={!!highlightRegex}
            onClick={() =>
              updateHighlight({
                id,
                matchWord: !matchWord,
              })
            }
          >
            Точно
          </Button.Checkbox>
        </Stack.Item>
        <Stack.Item>
          <Button.Checkbox
            tooltip="Учитывать регистр букв"
            checked={matchCase}
            onClick={() =>
              updateHighlight({
                id,
                matchCase: !matchCase,
              })
            }
          >
            Регистр
          </Button.Checkbox>
        </Stack.Item>
        <Stack.Item>
          <ColorBox mr={1} color={highlightColor} />
          <Input
            width="5em"
            monospace
            placeholder="#ffffff"
            value={highlightColor}
            onBlur={(value) =>
              updateHighlight({
                id,
                highlightColor: value,
              })
            }
          />
        </Stack.Item>
      </Stack>
      <TextArea
        fluid
        height="3em"
        value={highlightText}
        placeholder="Слова для подсветки через запятую (слово1, слово2, слово3)"
        style={{ border: isRegexValid ? '' : '1px solid red' }}
        onBlur={(value) =>
          updateHighlight({
            id: id,
            highlightText: value,
          })
        }
      />
    </Stack.Item>
  );
}
