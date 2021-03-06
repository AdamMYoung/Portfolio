import * as React from 'react';
import { graphql, navigate } from 'gatsby';

import List from '../components/list';
import image from '../images/Relaxing on a weekend.svg';
import InfoPage from '../views/info-page';

// markup
const Index = ({ data }) => {
    return (
        <InfoPage
            title="Blog"
            description="A collection of tips and guides relating to software development."
            src={image}
            alt="Illustration of man working on a laptop in a tent"
        >
            <h1 className="text-5xl font-bold mb-4">Blog</h1>
            <p className="text-lg font-semibold">
                Below you can find my blog posts, typically about FE technologies, best practices or any issues that
                I've faced recently.
            </p>
            <div className="mt-16">
                <h2 className="text-4xl font-bold mb-4">Posts</h2>
                <List active>
                    {data.allContentfulBlogPost.edges.map(({ node }) => (
                        <List.Item key={node.slug} onClick={() => navigate(`/blog${node.slug}`)}>
                            {node.title}
                        </List.Item>
                    ))}
                </List>
            </div>
        </InfoPage>
    );
};

export const query = graphql`
    {
        allContentfulBlogPost(limit: 5, sort: { fields: publishDate, order: DESC }) {
            edges {
                node {
                    title
                    slug
                    createdAt
                    summary {
                        summary
                    }
                }
            }
        }
    }
`;

export default Index;
