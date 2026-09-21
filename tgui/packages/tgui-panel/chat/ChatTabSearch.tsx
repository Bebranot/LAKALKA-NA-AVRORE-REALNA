import { useAtom } from 'jotai';
import { useState } from 'react';
import { Button, Input } from 'tgui-core/components';
import { tabSearchQueryAtom } from './atom';

export function ChatTabSearch(props) {
  const [query, setQuery] = useAtom(tabSearchQueryAtom);
  const [expanded, setExpanded] = useState(false);

  if (!expanded && !query) {
    return (
      <Button
        color="transparent"
        icon="search"
        tooltip="Показать только вкладки с совпадением"
        tooltipPosition="bottom-start"
        onClick={() => setExpanded(true)}
      >
        ПОИСК
      </Button>
    );
  }

  return (
    <Input
      autoFocus
      autoSelect
      placeholder="Название вкладки или тип..."
      value={query}
      onChange={(value) => setQuery(value)}
      onEscape={() => {
        setQuery('');
        setExpanded(false);
      }}
      onBlur={() => {
        if (!query) {
          setExpanded(false);
        }
      }}
    />
  );
}
