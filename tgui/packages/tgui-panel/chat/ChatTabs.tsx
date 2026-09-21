/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

import { useAtom, useAtomValue } from 'jotai';
import { Box, Button, Stack, Tabs } from 'tgui-core/components';
import { settingsVisibleAtom } from '../settings/atoms';
import { tabSearchQueryAtom } from './atom';
import { matchesTabSearch } from './searchSynonyms';
import { useChatPages } from './use-chat-pages';

type UnreadCountWidgetProps = {
  value: number;
};

function UnreadCountWidget(props: UnreadCountWidgetProps) {
  const { value } = props;

  return <Box className="UnreadCount">{Math.min(value, 99)}</Box>;
}

export function ChatTabs(props) {
  const { addChatPage, changeChatPage, pages, pagesRecord, currentPageId } =
    useChatPages();

  const [, setSettingsVisible] = useAtom(settingsVisibleAtom);
  const searchQuery = useAtomValue(tabSearchQueryAtom);

  const visiblePages = searchQuery
    ? pages.filter((page) => matchesTabSearch(pagesRecord[page], searchQuery))
    : pages;

  return (
    <Stack align="center">
      <Stack.Item>
        <Tabs scrollable textAlign="center">
          {visiblePages.map((page) => {
            const actual = pagesRecord[page];
            return (
              <Tabs.Tab
                key={page}
                selected={page === currentPageId}
                onClick={() => changeChatPage(actual)}
              >
                {actual.name}
                {!actual.hideUnreadCount && actual.unreadCount > 0 && (
                  <UnreadCountWidget value={actual.unreadCount} />
                )}
              </Tabs.Tab>
            );
          })}
        </Tabs>
      </Stack.Item>
      <Stack.Item>
        <Button
          color="transparent"
          icon="plus"
          onClick={() => {
            addChatPage();
            setSettingsVisible(true);
          }}
        />
      </Stack.Item>
    </Stack>
  );
}
