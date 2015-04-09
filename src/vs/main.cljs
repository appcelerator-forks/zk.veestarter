(ns vs.main
  (:require [vee.ti :as ti]
            [vee.reload :as reload]))

(ti/enable-console-print!)

(ti/update! js/Ti.App {:background-color "white"})

(defn start-app []
  (ti/open
    (ti/win {:background-color "white"}
      (ti/view {}
        (ti/label {:text "Hello Vee"})))))

(defn stop-app [win]
  (when win
    (ti/close win)))

;; Live Reload

(reload/start
  {:base-url "http://localhost:8083" #_ "http://192.168.1.67:8083"
   :start-app start-app
   :stop-app stop-app})
