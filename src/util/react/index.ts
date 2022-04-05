import { RenderableContent } from './RenderableContent';

function renderContent(content: RenderableContent, props?: any) {
    return typeof content === 'function' ? content(props) : content;
}

export * from './RenderableContent';
export { renderContent };
