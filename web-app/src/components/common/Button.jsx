import styled from '@emotion/styled'

const StyledButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radius.md};
  border: none;
  background: ${({ theme }) => theme.color.primary};
  color: #fff;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`

export default function Button({ children, ...props }) {
  return <StyledButton {...props}>{children}</StyledButton>
}
