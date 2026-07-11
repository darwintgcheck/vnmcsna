import React, { useState } from "react"
import { Modal } from "../components/Modal"
import { useUserStore } from "../hooks/useUserStore"

// bizim əlavə etdiklərimiz
import DepositModal from "../components/DepositModal"
import WithdrawModal from "../components/WithdrawModal"

function UserModal() {
  const user = useUserStore()
  const [removing, setRemoving] = useState(false)

  return (
    <Modal onClose={() => user.set({ userModal: false })}>
      <h1>👤 მომხმარებელი</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "100%",
          padding: "0 20px",
        }}
      >
        {/* Balans */}
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          ბალანსი: {user.balance} ⭐
        </div>

        {/* İstifadəçi məlumatları */}
        <div>
          <p>
            <b>სახელი:</b> {user.firstName ?? "—"}
          </p>
          <p>
            <b>გვარი:</b> {user.lastName ?? "—"}
          </p>
          <p>
            <b>ტელეფონი:</b> {user.phone ?? "—"}
          </p>
          <p>
            <b>პასპორტი:</b> {user.passport ?? "—"}
          </p>
          <p>
            <b>დაბადების თარიღი:</b> {user.birthDate ?? "—"}
          </p>
        </div>

        {/* Çıxış düyməsi */}
        <button
          style={{
            background: "#ff3c3c",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
            cursor: "pointer",
          }}
          onClick={() => {
            user.set({
              balance: 0,
              firstName: null,
              lastName: null,
              phone: null,
              passport: null,
              birthDate: null,
            })
          }}
        >
          🚪 გასვლა
        </button>
      </div>
    </Modal>
  )
}

export function UserButton() {
  const user = useUserStore()

  // bizim əlavə etdiyimiz modallar
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  return (
    <>
      {user.userModal && <UserModal />}
      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{
            background: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "5px 15px",
            cursor: "pointer",
          }}
          onClick={() => setShowDeposit(true)}
        >
          💵 დეპოზიტი
        </button>
        <button
          style={{
            background: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "5px 15px",
            cursor: "pointer",
          }}
          onClick={() => setShowWithdraw(true)}
        >
          💳 გამოტანა
        </button>
        <button
          style={{
            background: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "5px 15px",
            cursor: "pointer",
          }}
          onClick={() => user.set({ userModal: true })}
        >
          👤 პროფილი
        </button>
      </div>
    </>
  )
}
