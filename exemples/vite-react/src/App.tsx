import {useEffect, useState} from 'react'
import './App.css'

import { TransposedGridReact } from 'transposed-grid-react'

function App() {

  const [data, setData] = useState<any>([])

  useEffect(() => {
    fetch('http://localhost:30000/fakeData')
      .then(response => response.json())
      .then(data => setData(data));
  }, [])

  return (
    <div className="App">
      <TransposedGridReact
        primaryKey={'id'}
        items={data}
        striped
        bordered
        allowHeaderFiltering={false}
        editing={{
          allowUpdating: true,
          startEditAction: 'click' as any,
        }}
        selection={{
          mode: 'multiple' as any,
        }}
        onItemClick={(data) => console.log('onItemClick', data)}
        onItemDoubleClick={(data) => console.log('onItemDblClick', data)}
        // onItemHoovering={(data) => console.log('onItemHoovering', data)}
        // onItemInserting={async () => console.log('onItemInserting')}
        // onItemInserted={async () => console.log('onItemInserted')}
        // onItemUpdating={async () => console.log('onItemUpdating')}
        // onItemUpdated={async () => console.log('onItemUpdated')}
        // onItemRemoving={async () => console.log('onItemRemoving')}
        // onItemRemoved={async () => console.log('onItemRemoved')}
        onEditionValidation={async () => console.log('onItemValidating')}
        onSave={async (event) => {
          // event.cancelSubmit = true
          console.log('onSaving', event);
        }}
        onCancel={async (event) => console.log('onCanceled', event)}
        onItemSelectionChange={(event) => console.log('onSelectionChanged', event.detail.selectedItems)}

        // allowSorting={false}
        rows={[
          // {
          //   dataField: 'id',
          //   visible: false,
          // },
          {
            caption: 'Name',
            dataField: 'name',
          },
          {
            caption: 'Company',
            dataField: 'company',
          },
          {
            caption: 'Birth Date bla bla bla bla bla',
            dataField: 'birthdate',
          },
          {
            group: 'address',
            caption: 'City',
            dataField: 'city',
          },
          {
            group: 'address',
            caption: 'Country',
            dataField: 'country',
          },
          {
            group: 'internet',
            caption: 'Email',
            dataField: 'email',
          },
          {
            caption: 'Avatar',
            dataField: 'avatar',
            cellRender: (props) => {
              // props.setSettings({
              //   className: 'bg-red',
              //   style: {
              //     backgroundColor: 'darkred'
              //   }
              // })

              if (!props.value) {
                return <></>
              }

              return (
                <img src={props.value} className={'w-[5rem]'} alt={'avatar'} />
              )
            }
          },
          {
            group: 'address',
            caption: 'Photo',
            dataField: 'commonPhoto',
            cellRender: (props) => {
              if (!props.value) {
                return <></>
              }

              return (
                <img src={props.value} alt={'photo'} style={{
                  height: '5em',
                  width: '5em',
                }} />
              )
            }
          },
          {
            group: 'animal',
            dataField: 'dog',
            caption: 'Dog'
          },
          {
            group: 'animal',
            dataField: 'cat',
            caption: 'Cat'
          },
          {
            group: 'animal',
            dataField: 'bird',
            caption: 'Bird'
          },
          {
            group: 'animal',
            dataField: 'bear',
            caption: 'Bear'
          },
          {
            group: 'animal',
            caption: 'Country',
            dataField: 'country',
          },
        ]}
        groups={[
          {
            name: 'address',
            caption: 'Address',
            collapsed: false,
            // onGroupCollapsed: (evt) => {
            //   evt.collapsed = false
            // }
          },
          {
            name: 'internet',
            caption: 'Internet of Things & bla bla bla bla bla and bla bla bla',
            collapsed: false,
          },
          {
            name: 'animal',
            caption: 'Animal',
            collapsed: false,
          }
        ]}
      />
    </div>
  )
}

export default App
