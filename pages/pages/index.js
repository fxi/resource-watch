import React from 'react';
import Page from 'components/layout/page';
import PagesTable from 'components/pages/table/PagesTable';
import ButtonContainer from 'components/ui/ButtonContainer';
import Title from 'components/ui/Title';

export default class PagesIndex extends React.Component {

  render() {
    return (
      <Page
        title="Pages"
        description="Pages description..."
      >
        <div className="row">
          <div className="column small-12">
            <Title className="-huge -p-primary">
              Pages
            </Title>
            <ButtonContainer
              className="-end"
              buttons={[{
                label: 'New +',
                path: '/admin/insights/new',
                className: ''
              }]}
            />
            <PagesTable
              application={['rw']}
              authorization={process.env.TEMP_TOKEN}
            />
          </div>
        </div>
      </Page>
    );
  }
}