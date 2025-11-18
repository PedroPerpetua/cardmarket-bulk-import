import { i18n } from '#imports';

import { Col, Container, Row, Image } from 'react-bootstrap';

import Panel from './panels-context/Panel';
import Instructions1 from '../../../assets/instructions-1.png';
import Instructions2 from '../../../assets/instructions-2.png';
import Instructions3 from '../../../assets/instructions-3.png';
import Instructions4 from '../../../assets/instructions-4.png';

function InstructionsPanel() {
  return (
    <Panel title={i18n.t('popup.panels.instructions.title')}>
      <Container style={{ paddingBottom: 'var(--body-padding)' }}>
        <Row>
          <Col xs={1}>1.</Col>
          <Col>
            <p className="text-justify">
              { i18n.t('popup.panels.instructions.step_1_a') }
              <a
                href="https://www.cardmarket.com/en/Magic/Stock/ListingMethods/BulkListing"
                target="_blank"
                rel="noreferrer"
              >
                { i18n.t('popup.panels.instructions.step_1_b') }
              </a>
              { i18n.t('popup.panels.instructions.step_1_c') }
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={1}>2.</Col>
          <Col>
            <p className="text-justify">
              { i18n.t('popup.panels.instructions.step_2') }
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={1} />
          <Col>
            <Image src={Instructions1} className="w-100" />
          </Col>
        </Row>
        <Row>
          <Col xs={1}>3.</Col>
          <Col>
            <p className="text-justify">
              { i18n.t('popup.panels.instructions.step_3') }
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={1} />
          <Col>
            <Image src={Instructions2} className="w-100" />
          </Col>
        </Row>
        <Row>
          <Col xs={1}>4.</Col>
          <Col>
            <p className="text-justify">
              { i18n.t('popup.panels.instructions.step_4') }
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={1} />
          <Col className="d-flex justify-content-center">
            <Image src={Instructions3} className="w-100" />
          </Col>
        </Row>
        <Row>
          <Col xs={1}>5.</Col>
          <Col>
            <p className="text-justify">
              { i18n.t('popup.panels.instructions.step_5') }
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={1} />
          <Col className="d-flex justify-content-center">
            <Image src={Instructions4} className="w-100" />
          </Col>
        </Row>
      </Container>
    </Panel>
  );
}

export default InstructionsPanel;
