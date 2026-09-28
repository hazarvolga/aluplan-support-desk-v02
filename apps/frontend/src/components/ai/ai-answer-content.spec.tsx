import { render, screen } from '@testing-library/react';
import { AiAnswerContent } from './ai-answer-content';

describe('AiAnswerContent', () => {
    it('renders structured AI markdown and removes executable markup', () => {
        const { container } = render(
            <AiAnswerContent content={'## Solution\n- Reset the workspace\n<script>alert(1)</script>'} />,
        );

        expect(screen.getByRole('heading', { name: 'Solution' })).toBeInTheDocument();
        expect(screen.getByText('Reset the workspace')).toBeInTheDocument();
        expect(container.querySelector('script')).toBeNull();
    });

    it('renders nothing for a missing answer', () => {
        const { container } = render(<AiAnswerContent content={null} />);
        expect(container).toBeEmptyDOMElement();
    });
});
