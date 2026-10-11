export default function Modal({id, titleId, children}) {
  return (
    <dialog id={id} className="modal" aria-labelledby={titleId}>
      <div className="modal-body">
        <button type="button" className="modal-close" data-close aria-label="Close">✕</button>
        {children}
      </div>
    </dialog>
  )
}
