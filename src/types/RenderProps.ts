export type RenderProps<P> = Partial<{
    render: (props: P) => JSX.Element | null;
    children: (props: P) => JSX.Element | null;
}>;
