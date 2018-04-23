import React from 'react';
import PropTypes from 'prop-types';

// Next
import { Router } from 'routes';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';
import { setEmbed } from 'redactions/common';

// Components
import Page from 'layout/page';
import LayoutEmbed from 'layout/layout/layout-embed';
import SimilarDatasets from 'components/datasets/similar-datasets/similar-datasets';

class EmbedSimilarDatasets extends Page {
  static propTypes = {
    loading: PropTypes.bool.isRequired
  };

  static defaultProps = {
    loading: true
  };

  static async getInitialProps(context) {
    const props = await super.getInitialProps(context);
    const { store, isServer, req } = context;

    store.dispatch(setEmbed(true));

    return {
      ...props,
      referer: isServer ? req.headers.referer : window.location.href
    };
  }

  isLoadedExternally() {
    return !/localhost|(staging\.)?resourcewatch.org/.test(this.props.referer);
  }

  render() {
    const { url, loading } = this.props;
    const titleSt = loading ? 'Loading similar datasets...' : '';

    return (
      <LayoutEmbed
        title={titleSt}
        description=""
      >
        <div className="c-embed-similar-datasets">
          <SimilarDatasets
            datasetIds={url.query.id}
            onTagSelected={tag => Router.pushRoute('explore', { topics: `["${tag.id}"]` })}
          />
        </div>
      </LayoutEmbed>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.similarDatasets.loading
});

export default withRedux(initStore, mapStateToProps, null)(EmbedSimilarDatasets);
