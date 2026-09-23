import { i18n } from '#imports';

import { clsx } from 'clsx';
import { useMemo } from 'react';
import { Alert, Badge, Button, ListGroup, Stack, Tab, Tabs } from 'react-bootstrap';

import type { ParsedRow } from '../game-manager';

const MAX_FILL_ROWS = 100;

type EditionGroup = {
  cardmarketId: number,
  code: string,
  name: string,
  count: number,
};

type EditionDashboardProps = {
  rows: ParsedRow[],
  onManualSelect: () => void,
  onFillThisPage: (rows: ParsedRow[]) => void,
};

function buildEditionUrl(cardmarketId: number): string {
  const locale = window.location.pathname.split('/')[1] ?? 'en';
  return `https://www.cardmarket.com/${locale}/Magic/Stock/ListingMethods/BulkListing?idExpansion=${cardmarketId}`;
}

function openEditionTab(cardmarketId: number, active = false) {
  const url = buildEditionUrl(cardmarketId);
  const tab = window.open(url, '_blank');
  if (active) tab?.focus();
}

function EditionDashboard({ rows, onManualSelect, onFillThisPage }: EditionDashboardProps) {
  const currentEditionId = Number(new URLSearchParams(window.location.search).get('idExpansion')) || null;

  const currentEditionRows = rows.filter(
    (r) => currentEditionId !== null
      && (r as ParsedRow & { cardmarketId?: number | null }).cardmarketId === currentEditionId,
  );
  const fillableRows = (currentEditionRows.length > 0 ? currentEditionRows : rows.filter((r) => r.enabled))
    .slice(0, MAX_FILL_ROWS);
  const visibleFillableCount = fillableRows.filter((r) => r.enabled).length;

  const { editions, orphanRows } = useMemo(() => {
    const map = new Map<number, EditionGroup>();
    const orphans: ParsedRow[] = [];
    for (const row of rows) {
      const cmId = (row as ParsedRow & { cardmarketId?: number | null }).cardmarketId;
      const code = (row as ParsedRow & { set?: string }).set ?? '';
      const setName = (row as ParsedRow & { setName?: string }).setName ?? '';
      if (!cmId) {
        orphans.push(row);
        continue;
      }
      const existing = map.get(cmId);
      if (existing) {
        existing.count += 1;
      }
      else {
        map.set(cmId, {
          cardmarketId: cmId,
          code,
          name: setName || code,
          count: 1,
        });
      }
    }
    return {
      editions: [...map.values()].sort((a, b) => b.count - a.count),
      orphanRows: orphans,
    };
  }, [rows]);

  const foilRows = useMemo(
    () => rows.filter((r) => (r as ParsedRow & { isFoil?: boolean }).isFoil),
    [rows],
  );

  const totalMatched = editions.reduce((acc, e) => acc + e.count, 0);
  const otherEditionsCount = editions.filter((e) => e.cardmarketId !== currentEditionId).length;
  const hasInvisibleRows = visibleFillableCount < fillableRows.length;

  return (
    <Stack gap={3}>
      <div>
        <h5 className="mb-1">
          { i18n.t('injectedButton.modal.editionDashboard.title') }
        </h5>
        <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
          { totalMatched.toString() }
          { i18n.t('injectedButton.modal.editionDashboard.summary_a') }
          { editions.length.toString() }
          { i18n.t('injectedButton.modal.editionDashboard.summary_b') }
        </p>
      </div>

      <Tabs defaultActiveKey="fillPage" className="mb-0">
        <Tab
          eventKey="fillPage"
          title={
            i18n.t('injectedButton.modal.editionDashboard.tab.fillPage')
            + ` (${fillableRows.length.toString()})`
          }
        >
          <Stack gap={3} className="pt-3">
            {
              fillableRows.length === 0
                ? (
                    <Alert variant="secondary" className="mb-0 py-2">
                      { i18n.t('injectedButton.modal.editionDashboard.fillPageEmpty') }
                    </Alert>
                  )
                : (
                    <>
                      <Stack direction="horizontal" gap={2} className="align-items-center">
                        <Button
                          variant="success"
                          disabled={visibleFillableCount === 0}
                          onClick={() => onFillThisPage(fillableRows)}
                        >
                          { i18n.t('injectedButton.modal.editionDashboard.fillPageButton') }
                          {
                            hasInvisibleRows
                              ? ` (${visibleFillableCount.toString()} / ${fillableRows.length.toString()})`
                              : ` (${fillableRows.length.toString()})`
                          }
                        </Button>
                        <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                          {
                            hasInvisibleRows
                              ? i18n.t('injectedButton.modal.editionDashboard.fillPagePartialHint')
                              : i18n.t('injectedButton.modal.editionDashboard.fillPageHint')
                          }
                        </span>
                      </Stack>
                      {
                        hasInvisibleRows && (
                          <Alert variant="warning" className="mb-0 py-2">
                            { (fillableRows.length - visibleFillableCount).toString() }
                            { i18n.t('injectedButton.modal.editionDashboard.fillPageInvisibleWarning') }
                          </Alert>
                        )
                      }
                      <ListGroup style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {
                          fillableRows.map((row) => {
                            const setCode = (row as ParsedRow & { set?: string }).set;
                            const isFoil = (row as ParsedRow & { isFoil?: boolean }).isFoil;
                            const isVisible = row.enabled;
                            return (
                              <ListGroup.Item
                                key={row.id}
                                className={clsx('py-2', !isVisible && 'opacity-50')}
                                title={
                                  isVisible
                                    ? undefined
                                    : i18n.t('injectedButton.modal.editionDashboard.fillPageRowInvisibleTooltip')
                                }
                              >
                                <Stack direction="horizontal" gap={2} className="align-items-center">
                                  {
                                    setCode && (<Badge bg="secondary" pill>{ setCode }</Badge>)
                                  }
                                  <span
                                    className={clsx('text-truncate', isFoil && 'fw-semibold')}
                                    style={{ minWidth: 0 }}
                                  >
                                    { row.name.value }
                                  </span>
                                  {
                                    isFoil && (
                                      <Badge bg="warning" text="dark" pill>
                                        { i18n.t('injectedButton.modal.editionDashboard.foilBadge') }
                                      </Badge>
                                    )
                                  }
                                  {
                                    !isVisible && (
                                      <Badge bg="warning" text="dark" pill>
                                        { i18n.t('injectedButton.modal.editionDashboard.fillPageRowInvisibleBadge') }
                                      </Badge>
                                    )
                                  }
                                  <span className="text-secondary ms-auto" style={{ fontSize: '0.875rem' }}>
                                    { row.condition.data.badgeElement }
                                    { ' · ' }
                                    { '×' + (row.quantity || 1).toString() }
                                  </span>
                                </Stack>
                              </ListGroup.Item>
                            );
                          })
                        }
                      </ListGroup>
                    </>
                  )
            }
          </Stack>
        </Tab>

        <Tab
          eventKey="matched"
          title={
            i18n.t('injectedButton.modal.editionDashboard.tab.matched')
            + ` (${editions.length.toString()})`
          }
        >
          <Stack gap={3} className="pt-3">
            {
              editions.length > 0 && (
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant="primary"
                    disabled={otherEditionsCount === 0}
                    onClick={() => {
                      for (const ed of editions) {
                        if (ed.cardmarketId === currentEditionId) continue;
                        openEditionTab(ed.cardmarketId, false);
                      }
                    }}
                  >
                    { i18n.t('injectedButton.modal.editionDashboard.openAll') }
                    { ` (${otherEditionsCount.toString()})` }
                  </Button>
                  <Button variant="outline-secondary" onClick={onManualSelect}>
                    { i18n.t('injectedButton.modal.editionDashboard.manualSelect') }
                  </Button>
                </Stack>
              )
            }

            <ListGroup style={{ maxHeight: 360, overflowY: 'auto' }}>
              {
                editions.map((ed) => {
                  const isCurrent = ed.cardmarketId === currentEditionId;
                  return (
                    <ListGroup.Item
                      key={ed.cardmarketId}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <Stack direction="horizontal" gap={2} className="align-items-center">
                        <Badge bg="secondary" pill>{ ed.code }</Badge>
                        <span>{ ed.name }</span>
                        {
                          isCurrent && (
                            <Badge bg="info">
                              { i18n.t('injectedButton.modal.editionDashboard.currentBadge') }
                            </Badge>
                          )
                        }
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="align-items-center">
                        <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                          { ed.count.toString() }
                          { i18n.t('injectedButton.modal.editionDashboard.cardCount') }
                        </span>
                        <Button
                          size="sm"
                          variant={isCurrent ? 'outline-secondary' : 'primary'}
                          onClick={() => openEditionTab(ed.cardmarketId, isCurrent)}
                        >
                          {
                            isCurrent
                              ? i18n.t('injectedButton.modal.editionDashboard.reopenButton')
                              : i18n.t('injectedButton.modal.editionDashboard.openButton')
                          }
                        </Button>
                      </Stack>
                    </ListGroup.Item>
                  );
                })
              }
            </ListGroup>
          </Stack>
        </Tab>

        <Tab
          eventKey="foils"
          title={
            i18n.t('injectedButton.modal.editionDashboard.tab.foils')
            + ` (${foilRows.length.toString()})`
          }
          disabled={foilRows.length === 0}
        >
          <Stack gap={2} className="pt-3">
            <Alert variant="warning" className="mb-0 py-2" style={{ fontSize: '0.875rem' }}>
              { i18n.t('injectedButton.modal.editionDashboard.foilsExplain') }
            </Alert>
            <ListGroup style={{ maxHeight: 360, overflowY: 'auto' }}>
              {
                foilRows.map((row) => {
                  const setCode = (row as ParsedRow & { set?: string }).set;
                  return (
                    <ListGroup.Item key={row.id} className="py-2">
                      <Stack direction="horizontal" gap={2} className="align-items-center">
                        {
                          setCode
                            ? (<Badge bg="secondary" pill>{ setCode }</Badge>)
                            : (<Badge bg="secondary" pill>?</Badge>)
                        }
                        <span className="text-truncate fw-semibold" style={{ minWidth: 0 }}>
                          { row.name.value }
                        </span>
                        <Badge bg="warning" text="dark" pill>
                          { i18n.t('injectedButton.modal.editionDashboard.foilBadge') }
                        </Badge>
                        <span className="text-secondary ms-auto" style={{ fontSize: '0.875rem' }}>
                          { '×' + (row.quantity || 1).toString() }
                        </span>
                      </Stack>
                    </ListGroup.Item>
                  );
                })
              }
            </ListGroup>
          </Stack>
        </Tab>

        <Tab
          eventKey="unmatched"
          title={
            i18n.t('injectedButton.modal.editionDashboard.tab.unmatched')
            + ` (${orphanRows.length.toString()})`
          }
          disabled={orphanRows.length === 0}
        >
          <Stack gap={2} className="pt-3">
            <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
              { i18n.t('injectedButton.modal.editionDashboard.unmatchedExplain') }
            </p>
            <ListGroup style={{ maxHeight: 360, overflowY: 'auto' }}>
              {
                orphanRows.map((row) => {
                  const setCode = (row as ParsedRow & { set?: string }).set;
                  return (
                    <ListGroup.Item key={row.id} className="py-2">
                      <Stack direction="horizontal" gap={2} className="align-items-center">
                        {
                          setCode
                            ? (<Badge bg="warning" text="dark" pill>{ setCode }</Badge>)
                            : (<Badge bg="secondary" pill>?</Badge>)
                        }
                        <span className="text-truncate" style={{ minWidth: 0 }}>{ row.name.value }</span>
                        <span className="text-secondary ms-auto" style={{ fontSize: '0.875rem' }}>
                          { '×' + (row.quantity || 1).toString() }
                        </span>
                      </Stack>
                    </ListGroup.Item>
                  );
                })
              }
            </ListGroup>
          </Stack>
        </Tab>
      </Tabs>
    </Stack>
  );
}

export default EditionDashboard;
