import React from 'react'

interface Props {
	leftHeader?: React.ReactNode
	rightAction?: React.ReactNode
	isDisconnect?: boolean
	[rest: string]: any
}

const CardLabel = ({leftHeader, rightAction, isDisconnect, ...rest}: Props) => {
	return (
		<div className='card-label-container ' {...rest}>
			<div className='card-label'>{leftHeader}</div>
			{rightAction ? (
				<div
					className={`card-label ${
						isDisconnect ? 'text-[#d43100]' : 'text-[#6851ff]'
					}`}>
					{rightAction}
				</div>
			) : null}
		</div>
	)
}

export default CardLabel
